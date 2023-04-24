import { useCallback, useId, useState } from "react";
import { useDropzone } from "react-dropzone";
import styles from "./Dropzone.module.css";
import Image from "next/image";
import { DeleteButton } from "../button/DeleteButton";

export const Dropzone = () => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFile: File) => {
    if (acceptedFile) {
      setPreviewImage(URL.createObjectURL(acceptedFile));
    }
    else {
      setPreviewImage(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    maxFiles: 1,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".gif"]
    },
    maxSize: 1024 * 1024 * 5, // 5 MB
    onDrop: (acceptedFiles) => onDrop(acceptedFiles[0])
  });

  const inputId = useId();

  return <div className={styles.container}>
    <div className={styles.topRow}>
      <label htmlFor={inputId}>Cover image</label>
      {previewImage && <DeleteButton type="button" onClick={() => setPreviewImage(null)} />}
    </div>
    <div {...getRootProps()} className={styles.dropzone}>
      <input {...getInputProps()} id={inputId} />
      {previewImage ?
        <Image
          src={previewImage}
          alt=""
          width={200}
          height={200}
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
