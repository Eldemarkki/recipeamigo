import { useCallback, useId, useState } from "react";
import { useDropzone } from "react-dropzone";
import styles from "./Dropzone.module.css";
import Image from "next/image";
import { DeleteButton } from "../button/DeleteButton";

export type DropzoneProps = {
  onDrop: (file: File | null) => void;
  initialPreviewUrl?: string | undefined | null;
}

export const Dropzone = ({ onDrop, initialPreviewUrl }: DropzoneProps) => {
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
      <label htmlFor={inputId}>Cover image</label>
      {previewImage && <DeleteButton type="button" onClick={() => setPreviewImage(undefined)} />}
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
            ? "Drop the files here..."
            : "Drag & drop some files here, or click to select files"
          }
        </p>}
    </div>
  </div>;
};