from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.transforms as transforms
from PIL import Image
import numpy as np
import io
import os
import gc

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

device = torch.device("cpu")

# ==============================
# Segmentation Head
# ==============================

class SegmentationHeadConvNeXt(nn.Module):
    def __init__(self, in_channels, out_channels, tokenW, tokenH):
        super().__init__()
        self.H, self.W = tokenH, tokenW

        self.stem = nn.Sequential(
            nn.Conv2d(in_channels, 128, kernel_size=7, padding=3),
            nn.GELU()
        )

        self.block = nn.Sequential(
            nn.Conv2d(128, 128, kernel_size=7, padding=3, groups=128),
            nn.GELU(),
            nn.Conv2d(128, 128, kernel_size=1),
            nn.GELU(),
        )

        self.classifier = nn.Conv2d(128, out_channels, 1)

    def forward(self, x):
        B, N, C = x.shape
        x = x.reshape(B, self.H, self.W, C).permute(0, 3, 1, 2)
        x = self.stem(x)
        x = self.block(x)
        return self.classifier(x)

# ==============================
# Lazy Model Loading
# ==============================

backbone = None
classifier = None

def load_models():
    global backbone, classifier
    if backbone is not None:
        return

    print("Loading DINOv2 backbone...")
    backbone = torch.hub.load("facebookresearch/dinov2", "dinov2_vits14")
    backbone.eval()
    backbone.to(device)

    classifier = SegmentationHeadConvNeXt(
        in_channels=384,
        out_channels=10,
        tokenW=34,
        tokenH=19
    ).to(device)

    classifier.load_state_dict(
        torch.load("segmentation_head.pth", map_location=device)
    )
    classifier.eval()
    gc.collect()
    print("Models loaded successfully!")

# ==============================
# Image Transform
# ==============================

transform = transforms.Compose([
    transforms.Resize((270, 480)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

# ==============================
# Routes
# ==============================

@app.get("/")
def home():
    return {"message": "Segmentation API is running."}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    load_models()

    image = Image.open(file.file).convert("RGB")
    input_tensor = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        features = backbone.forward_features(input_tensor)["x_norm_patchtokens"]
        logits = classifier(features)
        output = F.interpolate(
            logits,
            size=input_tensor.shape[2:],
            mode="bilinear",
            align_corners=False
        )
        prediction = torch.argmax(output, dim=1).squeeze().cpu().numpy()

    # Convert prediction to image
    pred_img = Image.fromarray((prediction * 25).astype(np.uint8))

    buf = io.BytesIO()
    pred_img.save(buf, format="PNG")
    buf.seek(0)

    return StreamingResponse(buf, media_type="image/png")
