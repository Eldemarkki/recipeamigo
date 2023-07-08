import { useCallback, useId, useState } from "react";
import { useDropzone } from "react-dropzone";
import styles from "./Dropzone.module.css";
import Image from "next/image";
import { DeleteButton } from "../button/DeleteButton";
import { useTranslation } from "next-i18next";

export type DropzoneProps = {
  onDrop: (file: File | null) => void;
  initialPreviewUrl?: string | undefined | null;
  onRemove?: () => void;
}

export const Dropzone = ({ onDrop, initialPreviewUrl, onRemove }: DropzoneProps) => {
  const { t } = useTranslation("recipeView");
  const [previewImage, setPreviewImage] = useState(initialPreviewUrl);

  const onDropHandler = useCallback((acceptedFile: File) => {
    onDrop(acceptedFile);
    if (acceptedFile) {
      setPreviewImage(URL.createObjectURL(acceptedFile));
    }
    else {
      setPreviewImage(undefined);
    }
  }, [onDrop]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    maxFiles: 1,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".gif"]
    },
    maxSize: 1024 * 1024 * 5, // 5 MB
    onDrop: (acceptedFiles) => onDropHandler(acceptedFiles[0])
  });

  const inputId = useId();

  return <div className={styles.container}>
    <div className={styles.topRow}>
      <label htmlFor={inputId}>{t("coverImageDropzone.title")}</label>
      {previewImage && <DeleteButton type="button" onClick={() => {
        setPreviewImage(undefined);
        onRemove?.();
      }} />}
    </div>
    <div {...getRootProps()} className={styles.dropzone}>
      <input {...getInputProps()} id={inputId} />
      {previewImage ?
        <Image
          src={previewImage}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={styles.previewImage}
        /> :
        <p className={styles.dragText}>
          {isDragActive
            ? t("coverImageDropzone.dragActive")
            : t("coverImageDropzone.dragInactive")
          }
        </p>}
    </div>
  </div>;
};
