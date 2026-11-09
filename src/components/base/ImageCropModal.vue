<template>
  <BaseModal
    :title="modalTitle"
    icon="bi bi-crop"
    theme="primary"
    @closeModal="emitCancel"
  >
    <div class="image-cropper">
      <!-- CROP STAGE -->
      <div
        ref="stageRef"
        class="crop-stage"
        @pointermove="handlePointerMove"
        @pointerup="handlePointerUp"
        @pointercancel="handlePointerUp"
      >
        <img
          ref="imageRef"
          :src="source?.url"
          alt="Image being cropped"
          class="crop-image"
          :style="imageStyle"
          draggable="false"
          @load="prepareImage"
        />
        <div class="crop-scrim"></div>

        <!-- CROP BOX (Draggable & Resizable) -->
        <div
          ref="cropBoxRef"
          class="crop-box"
          :class="{ circle: cropShape === 'circle' }"
          :style="cropBoxStyle"
          @pointerdown="handlePointerDown($event, 'move')"
        >
          <!-- Grid Overlay -->
          <span class="crop-grid horizontal one"></span>
          <span class="crop-grid horizontal two"></span>
          <span class="crop-grid vertical one"></span>
          <span class="crop-grid vertical two"></span>

          <!-- Corner Resize Handles (iPhone style L-shapes) -->
          <div class="crop-handle top-left" @pointerdown.stop="handlePointerDown($event, 'resize-top-left')"></div>
          <div class="crop-handle top-right" @pointerdown.stop="handlePointerDown($event, 'resize-top-right')"></div>
          <div class="crop-handle bottom-left" @pointerdown.stop="handlePointerDown($event, 'resize-bottom-left')"></div>
          <div class="crop-handle bottom-right" @pointerdown.stop="handlePointerDown($event, 'resize-bottom-right')"></div>
        </div>
      </div>

      <!-- ASPECT RATIO PRESETS (Only shown if shape is not circle) -->
      <div v-if="cropShape !== 'circle'" class="crop-ratio-container mt-2 mb-2">
        <span class="ratio-label"><i class="bi bi-aspect-ratio"></i> Aspect Ratio</span>
        <div class="ratio-presets">
          <button
            type="button"
            class="ratio-btn"
            :class="{ active: selectedAspectRatio === 'free' }"
            @click="setRatio('free')"
          >
            Free
          </button>
          <button
            type="button"
            class="ratio-btn"
            :class="{ active: selectedAspectRatio === 'original' }"
            @click="setRatio('original')"
          >
            Original
          </button>
          <button
            type="button"
            class="ratio-btn"
            :class="{ active: selectedAspectRatio === '1.77777777778' }"
            @click="setRatio('1.77777777778')"
          >
            16:9
          </button>
          <button
            type="button"
            class="ratio-btn"
            :class="{ active: selectedAspectRatio === '1.33333333333' }"
            @click="setRatio('1.33333333333')"
          >
            4:3
          </button>
          <button
            type="button"
            class="ratio-btn"
            :class="{ active: selectedAspectRatio === '1.5' }"
            @click="setRatio('1.5')"
          >
            3:2
          </button>
          <button
            type="button"
            class="ratio-btn"
            :class="{ active: selectedAspectRatio === '1' }"
            @click="setRatio('1')"
          >
            1:1
          </button>
        </div>
      </div>

      <p class="crop-hint text-center">
        Drag corners to resize. Drag inside the box to reposition.
      </p>
    </div>

    <template #footer>
      <button
        class="btn btn-light border"
        type="button"
        :disabled="isCropping"
        @click="emitCancel"
      >
        Cancel
      </button>
      <button
        class="btn btn-primary"
        type="button"
        :disabled="isCropping || !isReady"
        @click="applyCrop"
      >
        <span
          v-if="isCropping"
          class="spinner-border spinner-border-sm me-1"
          role="status"
        ></span>
        <i v-else class="bi bi-check2"></i>
        <span>Use Image</span>
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import BaseModal from "./BaseModal.vue";

const props = defineProps({
  source: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["confirm", "cancel"]);

const stageRef = ref(null);
const cropBoxRef = ref(null);
const imageRef = ref(null);

const baseWidth = ref(0);
const baseHeight = ref(0);
const naturalAspectRatio = ref(1);
const isReady = ref(false);
const isCropping = ref(false);

// Crop box positioning & dimensions (relative to stage coordinates)
const cropBoxLeft = ref(0);
const cropBoxTop = ref(0);
const cropBoxWidth = ref(0);
const cropBoxHeight = ref(0);

// Pointer interaction state
const activeAction = ref(null); // 'move' or 'resize-top-left', etc.
const startPos = ref({ x: 0, y: 0 });
const startBox = ref({ left: 0, top: 0, width: 0, height: 0 });

const cropOptions = computed(() => props.source?.options || {});
const cropShape = computed(() => cropOptions.value.shape || "rect");
const modalTitle = computed(() => cropOptions.value.title || "Crop Image");
const outputType = computed(
  () =>
    cropOptions.value.outputType || props.source?.file?.type || "image/jpeg",
);
const outputQuality = computed(() => Number(cropOptions.value.quality) || 0.92);

// Chosen crop box aspect ratio (can be 'free', 'original', or a numeric string)
const selectedAspectRatio = ref(
  cropShape.value === "circle"
    ? "1"
    : cropOptions.value.aspectRatio || "free"
);

const aspectRatio = computed(() => {
  if (selectedAspectRatio.value === "free") return null;
  if (selectedAspectRatio.value === "original") {
    return naturalAspectRatio.value || 1;
  }
  return Number(selectedAspectRatio.value) || 1;
});

const cropBoxStyle = computed(() => {
  return {
    position: "absolute",
    left: `${cropBoxLeft.value}px`,
    top: `${cropBoxTop.value}px`,
    width: `${cropBoxWidth.value}px`,
    height: `${cropBoxHeight.value}px`,
    transform: "none",
  };
});

const imageStyle = computed(() => ({
  width: `${baseWidth.value}px`,
  height: `${baseHeight.value}px`,
  left: "50%",
  top: "50%",
  transform: "translate(-50%, -50%)",
}));

const getContainedOutputName = () => {
  const fileName = props.source?.file?.name || "cropped-image.jpg";
  const dotIndex = fileName.lastIndexOf(".");
  const baseName = dotIndex > -1 ? fileName.slice(0, dotIndex) : fileName;
  const extension = outputType.value.includes("png")
    ? "png"
    : outputType.value.includes("webp")
      ? "webp"
      : "jpg";

  return `${baseName}-cropped.${extension}`;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

// Apply chosen aspect ratio to dimensions inside the image boundaries
const applyRatioDimensions = (ratioVal) => {
  const stage = stageRef.value;
  if (!stage || !baseWidth.value || !baseHeight.value) return;

  const stageRect = stage.getBoundingClientRect();
  const imgLeft = (stageRect.width - baseWidth.value) / 2;
  const imgTop = (stageRect.height - baseHeight.value) / 2;

  let newWidth, newHeight;

  if (ratioVal === "free") {
    newWidth = baseWidth.value * 0.9;
    newHeight = baseHeight.value * 0.9;
  } else {
    let activeRatio;
    if (ratioVal === "original") {
      activeRatio = naturalAspectRatio.value || 1;
    } else {
      activeRatio = Number(ratioVal) || 1;
    }

    // Try filling width
    newWidth = baseWidth.value * 0.9;
    newHeight = newWidth / activeRatio;

    // Constrain if height exceeds bounds
    if (newHeight > baseHeight.value * 0.9) {
      newHeight = baseHeight.value * 0.9;
      newWidth = newHeight * activeRatio;
    }
  }

  cropBoxWidth.value = newWidth;
  cropBoxHeight.value = newHeight;

  // Center crop box inside the image boundaries
  cropBoxLeft.value = imgLeft + (baseWidth.value - newWidth) / 2;
  cropBoxTop.value = imgTop + (baseHeight.value - newHeight) / 2;
};

const prepareImage = async () => {
  await nextTick();

  const image = imageRef.value;
  const stage = stageRef.value;
  if (!image || !stage || !image.naturalWidth || !image.naturalHeight) return;

  const stageRect = stage.getBoundingClientRect();
  const imageRatio = image.naturalWidth / image.naturalHeight;
  naturalAspectRatio.value = imageRatio;

  // Contain the image inside the stage bounding container
  const stageRatio = stageRect.width / stageRect.height;
  if (imageRatio > stageRatio) {
    baseWidth.value = stageRect.width;
    baseHeight.value = stageRect.width / imageRatio;
  } else {
    baseHeight.value = stageRect.height;
    baseWidth.value = stageRect.height * imageRatio;
  }

  isReady.value = true;
  applyRatioDimensions(selectedAspectRatio.value);
};

const resetCrop = async () => {
  isReady.value = false;
  await prepareImage();
};

const setRatio = (ratio) => {
  selectedAspectRatio.value = ratio;
  nextTick(() => {
    applyRatioDimensions(ratio);
  });
};

// Pointer Events handlers for resizing & moving
const handlePointerDown = (event, action) => {
  if (!isReady.value || isCropping.value) return;

  event.preventDefault();
  event.stopPropagation();

  // Capture pointer on the stage element so events are tracked everywhere
  stageRef.value?.setPointerCapture?.(event.pointerId);

  activeAction.value = action;
  startPos.value = {
    x: event.clientX,
    y: event.clientY,
  };
  startBox.value = {
    left: cropBoxLeft.value,
    top: cropBoxTop.value,
    width: cropBoxWidth.value,
    height: cropBoxHeight.value,
  };
};

const handlePointerMove = (event) => {
  if (!activeAction.value) return;

  event.preventDefault();
  event.stopPropagation();

  const dx = event.clientX - startPos.value.x;
  const dy = event.clientY - startPos.value.y;

  const stage = stageRef.value;
  if (!stage) return;

  const stageRect = stage.getBoundingClientRect();
  const imgLeft = (stageRect.width - baseWidth.value) / 2;
  const imgTop = (stageRect.height - baseHeight.value) / 2;
  const imgRight = imgLeft + baseWidth.value;
  const imgBottom = imgTop + baseHeight.value;

  const minSize = 50;

  if (activeAction.value === "move") {
    let newLeft = startBox.value.left + dx;
    let newTop = startBox.value.top + dy;

    // Keep crop box fully within image bounds
    newLeft = clamp(newLeft, imgLeft, imgRight - cropBoxWidth.value);
    newTop = clamp(newTop, imgTop, imgBottom - cropBoxHeight.value);

    cropBoxLeft.value = newLeft;
    cropBoxTop.value = newTop;
  } else if (activeAction.value.startsWith("resize-")) {
    const handleType = activeAction.value.replace("resize-", "");
    let newLeft = startBox.value.left;
    let newTop = startBox.value.top;
    let newWidth = startBox.value.width;
    let newHeight = startBox.value.height;

    // Aspect ratio locked resizing
    if (aspectRatio.value !== null) {
      const ratio = aspectRatio.value;

      if (handleType === "bottom-right" || handleType === "right" || handleType === "bottom") {
        let newW = startBox.value.width + dx;
        newW = clamp(newW, minSize, imgRight - startBox.value.left);
        let newH = newW / ratio;

        if (newH > imgBottom - startBox.value.top) {
          newH = imgBottom - startBox.value.top;
          newW = newH * ratio;
        }
        newWidth = newW;
        newHeight = newH;
      } else if (handleType === "top-left" || handleType === "left" || handleType === "top") {
        let newW = startBox.value.width - dx;
        newW = clamp(newW, minSize, startBox.value.left + startBox.value.width - imgLeft);
        let newH = newW / ratio;

        if (newH > startBox.value.top + startBox.value.height - imgTop) {
          newH = startBox.value.top + startBox.value.height - imgTop;
          newW = newH * ratio;
        }
        newLeft = startBox.value.left + (startBox.value.width - newW);
        newTop = startBox.value.top + (startBox.value.height - newH);
        newWidth = newW;
        newHeight = newH;
      } else if (handleType === "top-right") {
        let newW = startBox.value.width + dx;
        newW = clamp(newW, minSize, imgRight - startBox.value.left);
        let newH = newW / ratio;

        if (newH > startBox.value.top + startBox.value.height - imgTop) {
          newH = startBox.value.top + startBox.value.height - imgTop;
          newW = newH * ratio;
        }
        newTop = startBox.value.top + (startBox.value.height - newH);
        newWidth = newW;
        newHeight = newH;
      } else if (handleType === "bottom-left") {
        let newW = startBox.value.width - dx;
        newW = clamp(newW, minSize, startBox.value.left + startBox.value.width - imgLeft);
        let newH = newW / ratio;

        if (newH > imgBottom - startBox.value.top) {
          newH = imgBottom - startBox.value.top;
          newW = newH * ratio;
        }
        newLeft = startBox.value.left + (startBox.value.width - newW);
        newWidth = newW;
        newHeight = newH;
      }
    } else {
      // Free resizing
      if (handleType.includes("right")) {
        newWidth = clamp(startBox.value.width + dx, minSize, imgRight - startBox.value.left);
      }
      if (handleType.includes("left")) {
        const maxDx = startBox.value.width - minSize;
        const actualDx = clamp(dx, imgLeft - startBox.value.left, maxDx);
        newLeft = startBox.value.left + actualDx;
        newWidth = startBox.value.width - actualDx;
      }
      if (handleType.includes("bottom")) {
        newHeight = clamp(startBox.value.height + dy, minSize, imgBottom - startBox.value.top);
      }
      if (handleType.includes("top")) {
        const maxDy = startBox.value.height - minSize;
        const actualDy = clamp(dy, imgTop - startBox.value.top, maxDy);
        newTop = startBox.value.top + actualDy;
        newHeight = startBox.value.height - actualDy;
      }
    }

    cropBoxLeft.value = newLeft;
    cropBoxTop.value = newTop;
    cropBoxWidth.value = newWidth;
    cropBoxHeight.value = newHeight;
  }
};

const handlePointerUp = (event) => {
  if (!activeAction.value) return;

  stageRef.value?.releasePointerCapture?.(event.pointerId);
  activeAction.value = null;
};

const canvasToBlob = (canvas) =>
  new Promise((resolve) => {
    canvas.toBlob(resolve, outputType.value, outputQuality.value);
  });

const applyCrop = async () => {
  const image = imageRef.value;
  const cropBox = cropBoxRef.value;
  const stage = stageRef.value;
  if (!image || !cropBox || !stage || !isReady.value || isCropping.value) return;

  isCropping.value = true;

  try {
    const cropRect = cropBox.getBoundingClientRect();
    const imageRect = image.getBoundingClientRect();

    // Map DOM dimensions to natural image dimensions
    const sourceX =
      ((cropRect.left - imageRect.left) / imageRect.width) * image.naturalWidth;
    const sourceY =
      ((cropRect.top - imageRect.top) / imageRect.height) * image.naturalHeight;
    const sourceWidth = (cropRect.width / imageRect.width) * image.naturalWidth;
    const sourceHeight =
      (cropRect.height / imageRect.height) * image.naturalHeight;

    const canvas = document.createElement("canvas");
    const requestedWidth =
      cropOptions.value.outputWidth || Math.min(sourceWidth, 1600);
    const requestedHeight =
      cropOptions.value.outputHeight || requestedWidth / (sourceWidth / sourceHeight);

    const outputScale = Math.min(
      1,
      sourceWidth / requestedWidth,
      sourceHeight / requestedHeight,
    );
    const outputWidth = Math.round(requestedWidth * outputScale);
    const outputHeight = Math.round(requestedHeight * outputScale);

    canvas.width = outputWidth;
    canvas.height = outputHeight;

    const context = canvas.getContext("2d");
    const safeSourceX = clamp(sourceX, 0, image.naturalWidth - 1);
    const safeSourceY = clamp(sourceY, 0, image.naturalHeight - 1);
    const safeSourceWidth = clamp(
      sourceWidth,
      1,
      image.naturalWidth - safeSourceX,
    );
    const safeSourceHeight = clamp(
      sourceHeight,
      1,
      image.naturalHeight - safeSourceY,
    );

    context.drawImage(
      image,
      safeSourceX,
      safeSourceY,
      safeSourceWidth,
      safeSourceHeight,
      0,
      0,
      outputWidth,
      outputHeight,
    );

    const blob = await canvasToBlob(canvas);
    if (!blob) throw new Error("Unable to crop this image.");

    const file = new File([blob], getContainedOutputName(), {
      type: blob.type || outputType.value,
      lastModified: Date.now(),
    });

    emit("confirm", {
      file,
      blob,
      previewUrl: URL.createObjectURL(blob),
      dataUrl: canvas.toDataURL(
        blob.type || outputType.value,
        outputQuality.value,
      ),
      width: outputWidth,
      height: outputHeight,
    });
  } finally {
    isCropping.value = false;
  }
};

const emitCancel = () => {
  if (isCropping.value) return;
  emit("cancel");
};

const handleResize = () => {
  prepareImage();
};

watch(
  () => props.source?.url,
  () => {
    isReady.value = false;
    nextTick(prepareImage);
  },
);

window.addEventListener("resize", handleResize);

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
});
</script>

<style scoped>
:deep(.modal-dialog) {
  max-width: min(920px, calc(100vw - 2rem));
}

.image-cropper {
  display: grid;
  gap: 1rem;
}

.crop-stage {
  position: relative;
  height: min(60vh, 520px);
  min-height: 320px;
  overflow: hidden;
  touch-action: none;
  background:
    linear-gradient(45deg, rgba(255, 255, 255, 0.05) 25%, transparent 25%),
    linear-gradient(-45deg, rgba(255, 255, 255, 0.05) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, rgba(255, 255, 255, 0.05) 75%),
    linear-gradient(-45deg, transparent 75%, rgba(255, 255, 255, 0.05) 75%),
    #080a10;
  background-position:
    0 0,
    0 16px,
    16px -16px,
    -16px 0;
  background-size: 32px 32px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.crop-image {
  position: absolute;
  z-index: 1;
  display: block;
  max-width: none;
  max-height: none;
  user-select: none;
  transform-origin: center center;
  will-change: left, top, transform;
}

.crop-scrim {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background: rgba(0, 0, 0, 0.42);
}

.crop-box {
  position: absolute;
  z-index: 3;
  cursor: move;
  border: 2px solid rgba(255, 255, 255, 0.92);
  border-radius: 8px;
  box-shadow:
    0 0 0 9999px rgba(0, 0, 0, 0.38),
    0 18px 60px rgba(0, 0, 0, 0.35);
  box-sizing: border-box;
}

.crop-box.circle {
  border-radius: 999px;
  cursor: move;
}

.crop-grid {
  position: absolute;
  display: block;
  background: rgba(255, 255, 255, 0.3);
  pointer-events: none;
}

.crop-grid.horizontal {
  left: 0;
  width: 100%;
  height: 1px;
}

.crop-grid.vertical {
  top: 0;
  width: 1px;
  height: 100%;
}

.crop-grid.one.horizontal {
  top: 33.333%;
}

.crop-grid.two.horizontal {
  top: 66.666%;
}

.crop-grid.one.vertical {
  left: 33.333%;
}

.crop-grid.two.vertical {
  left: 66.666%;
}

/* iPhone Style Corner Drag Handles */
.crop-handle {
  position: absolute;
  width: 24px;
  height: 24px;
  border: 4px solid #ffffff;
  z-index: 10;
  box-sizing: border-box;
}

.crop-handle.top-left {
  top: -4px;
  left: -4px;
  border-right: none;
  border-bottom: none;
  cursor: nwse-resize;
}

.crop-handle.top-right {
  top: -4px;
  right: -4px;
  border-left: none;
  border-bottom: none;
  cursor: nesw-resize;
}

.crop-handle.bottom-left {
  bottom: -4px;
  left: -4px;
  border-right: none;
  border-top: none;
  cursor: nesw-resize;
}

.crop-handle.bottom-right {
  bottom: -4px;
  right: -4px;
  border-left: none;
  border-top: none;
  cursor: nwse-resize;
}

/* Controls */
.crop-ratio-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
}

.ratio-label {
  font-weight: 800;
  color: var(--color-text);
  font-size: 0.88rem;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.ratio-presets {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.ratio-btn {
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.ratio-btn:hover {
  border-color: var(--color-blue);
  color: var(--color-text);
}

.ratio-btn.active {
  background: var(--color-blue);
  border-color: var(--color-blue);
  color: #ffffff;
}

.crop-hint {
  color: var(--color-text-muted);
  font-size: 0.88rem;
  margin: -0.25rem 0 0;
}

.btn-primary,
.btn-light {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
}

@media (max-width: 640px) {
  .crop-stage {
    min-height: 280px;
    height: 52vh;
  }
}
</style>
