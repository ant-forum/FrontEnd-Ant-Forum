<template>
  <BaseModal
    :title="modalTitle"
    icon="bi bi-crop"
    theme="primary"
    @closeModal="emitCancel"
  >
    <div class="image-cropper">
      <div
        ref="stageRef"
        class="crop-stage"
        :class="{ dragging: isDragging }"
        @pointerdown="startDrag"
        @pointermove="moveDrag"
        @pointerup="stopDrag"
        @pointercancel="stopDrag"
        @pointerleave="stopDrag"
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
        <div
          ref="cropBoxRef"
          class="crop-box"
          :class="{ circle: cropShape === 'circle' }"
          :style="cropBoxStyle"
        >
          <span class="crop-grid horizontal one"></span>
          <span class="crop-grid horizontal two"></span>
          <span class="crop-grid vertical one"></span>
          <span class="crop-grid vertical two"></span>
        </div>
      </div>

      <div class="crop-controls">
        <label for="image-crop-zoom">
          <i class="bi bi-zoom-in"></i>
          Zoom
        </label>
        <input
          id="image-crop-zoom"
          v-model.number="zoom"
          type="range"
          min="1"
          max="3"
          step="0.01"
          @input="clampOffset"
        />
        <button type="button" class="btn-reset-crop" @click="resetCrop">
          Reset
        </button>
      </div>

      <p class="crop-hint">
        Drag the image to frame the part you want people to see.
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
const zoom = ref(1);
const offsetX = ref(0);
const offsetY = ref(0);
const baseWidth = ref(0);
const baseHeight = ref(0);
const naturalAspectRatio = ref(1);
const isReady = ref(false);
const isDragging = ref(false);
const isCropping = ref(false);
const dragStart = ref({ x: 0, y: 0, offsetX: 0, offsetY: 0 });

const cropOptions = computed(() => props.source?.options || {});
const aspectRatio = computed(() => {
  if (cropOptions.value.aspectRatio === "original") {
    return naturalAspectRatio.value || 1;
  }

  return Number(cropOptions.value.aspectRatio) || 1;
});
const cropShape = computed(() => cropOptions.value.shape || "rect");
const modalTitle = computed(() => cropOptions.value.title || "Crop Image");
const outputType = computed(
  () =>
    cropOptions.value.outputType || props.source?.file?.type || "image/jpeg",
);
const outputQuality = computed(() => Number(cropOptions.value.quality) || 0.92);

const cropBoxStyle = computed(() => ({
  aspectRatio: String(aspectRatio.value),
}));

const imageStyle = computed(() => ({
  width: `${baseWidth.value}px`,
  height: `${baseHeight.value}px`,
  left: `calc(50% + ${offsetX.value}px)`,
  top: `calc(50% + ${offsetY.value}px)`,
  transform: `translate(-50%, -50%) scale(${zoom.value})`,
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

const clampOffset = () => {
  const cropRect = cropBoxRef.value?.getBoundingClientRect();
  if (!cropRect || !baseWidth.value || !baseHeight.value) return;

  const scaledWidth = baseWidth.value * zoom.value;
  const scaledHeight = baseHeight.value * zoom.value;
  const maxX = Math.max(0, (scaledWidth - cropRect.width) / 2);
  const maxY = Math.max(0, (scaledHeight - cropRect.height) / 2);

  offsetX.value = clamp(offsetX.value, -maxX, maxX);
  offsetY.value = clamp(offsetY.value, -maxY, maxY);
};

const prepareImage = async () => {
  await nextTick();

  const image = imageRef.value;
  const cropBox = cropBoxRef.value;
  if (!image || !cropBox || !image.naturalWidth || !image.naturalHeight) return;

  const imageRatio = image.naturalWidth / image.naturalHeight;
  naturalAspectRatio.value = imageRatio;
  await nextTick();

  const cropRect = cropBox.getBoundingClientRect();
  const cropRatio = cropRect.width / cropRect.height;

  if (imageRatio > cropRatio) {
    baseHeight.value = cropRect.height;
    baseWidth.value = cropRect.height * imageRatio;
  } else {
    baseWidth.value = cropRect.width;
    baseHeight.value = cropRect.width / imageRatio;
  }

  zoom.value = 1;
  offsetX.value = 0;
  offsetY.value = 0;
  isReady.value = true;
  await nextTick();
  clampOffset();
};

const resetCrop = async () => {
  isReady.value = false;
  await prepareImage();
};

const startDrag = (event) => {
  if (!isReady.value || isCropping.value) return;

  isDragging.value = true;
  event.currentTarget.setPointerCapture?.(event.pointerId);
  dragStart.value = {
    x: event.clientX,
    y: event.clientY,
    offsetX: offsetX.value,
    offsetY: offsetY.value,
  };
};

const moveDrag = (event) => {
  if (!isDragging.value) return;

  offsetX.value = dragStart.value.offsetX + event.clientX - dragStart.value.x;
  offsetY.value = dragStart.value.offsetY + event.clientY - dragStart.value.y;
  clampOffset();
};

const stopDrag = (event) => {
  if (!isDragging.value) return;

  isDragging.value = false;
  event.currentTarget?.releasePointerCapture?.(event.pointerId);
};

const canvasToBlob = (canvas) =>
  new Promise((resolve) => {
    canvas.toBlob(resolve, outputType.value, outputQuality.value);
  });

const applyCrop = async () => {
  const image = imageRef.value;
  const cropBox = cropBoxRef.value;
  if (!image || !cropBox || !isReady.value || isCropping.value) return;

  isCropping.value = true;

  try {
    const cropRect = cropBox.getBoundingClientRect();
    const imageRect = image.getBoundingClientRect();
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
      cropOptions.value.outputHeight || requestedWidth / aspectRatio.value;
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
  cursor: grab;
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

.crop-stage.dragging {
  cursor: grabbing;
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
  top: 50%;
  left: 50%;
  width: min(78%, 680px);
  max-height: calc(100% - 48px);
  overflow: hidden;
  pointer-events: none;
  border: 2px solid rgba(255, 255, 255, 0.92);
  border-radius: 8px;
  box-shadow:
    0 0 0 9999px rgba(0, 0, 0, 0.38),
    0 18px 60px rgba(0, 0, 0, 0.35);
  transform: translate(-50%, -50%);
}

.crop-box.circle {
  width: min(70%, 420px);
  border-radius: 999px;
}

.crop-grid {
  position: absolute;
  display: block;
  background: rgba(255, 255, 255, 0.42);
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

.crop-controls {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.85rem;
}

.crop-controls label {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--color-text);
  font-weight: 800;
  margin: 0;
}

.crop-controls input[type="range"] {
  width: 100%;
  accent-color: var(--color-primary);
}

.btn-reset-crop {
  height: 36px;
  padding: 0 0.85rem;
  color: var(--color-text);
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-weight: 800;
}

.btn-reset-crop:hover {
  border-color: var(--color-primary);
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

  .crop-controls {
    grid-template-columns: 1fr auto;
  }

  .crop-controls label {
    grid-column: 1 / -1;
  }
}
</style>
