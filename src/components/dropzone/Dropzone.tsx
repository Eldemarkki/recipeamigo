import config from "../../config";
import { removeDuplicateStrings } from "../../utils/arrayUtils";
import { DeleteButton } from "../button/DeleteButton";
import styles from "./Dropzone.module.css";
import { useTranslation } from "next-i18next";
import Image from "next/image";
import { useCallback, useId, useState } from "react";
import { ErrorCode, useDropzone } from "react-dropzone";

export type DropzoneProps = {
  onDrop: (file: File | null) => void;
  initialPreviewUrl?: string | undefined | null;
  onRemove?: () => void;
};

export const Dropzone = ({
  onDrop,
  initialPreviewUrl,
  onRemove,
}: DropzoneProps) => {
  const { t } = useTranslation("recipeView");
  const [previewImage, setPreviewImage] = useState(initialPreviewUrl);
  const [errors, setErrors] = useState<string[]>([]);

  const removeImage = () => {
    setPreviewImage(undefined);
    onRemove?.();
  };

  const onDropHandler = useCallback(
    (acceptedFile: File) => {
      onDrop(acceptedFile);
      setPreviewImage(URL.createObjectURL(acceptedFile));
    },
    [onDrop],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    maxFiles: 1,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
    },
    maxSize: config.RECIPE_COVER_IMAGE_MAX_SIZE_BYTES,
    onDrop: (acceptedFiles, rejections) => {
      if (acceptedFiles.length === 1) {
        setErrors([]);
        onDropHandler(acceptedFiles[0]);
      } else if (rejections.length === 1) {
        console.log(rejections);
        rejections[0].errors.forEach((error) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
          if (error.code === ErrorCode.FileTooLarge) {
            setErrors((oldErrors) =>
              removeDuplicateStrings([
                ...oldErrors,
                t("coverImageDropzone.errors.fileIsTooLarge"),
              ]),
            );
            // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
          } else if (error.code === ErrorCode.FileInvalidType) {
            setErrors((oldErrors) =>
              removeDuplicateStrings([
                ...oldErrors,
                t("coverImageDropzone.errors.unsupportedFileType"),
              ]),
            );
          } else {
            setErrors((oldErrors) =>
              removeDuplicateStrings([
                ...oldErrors,
                t("coverImageDropzone.errors.unexpectedError"),
              ]),
            );
          }
        });
        removeImage();
      } else {
        setErrors((oldErrors) =>
          removeDuplicateStrings([
            ...oldErrors,
            t("coverImageDropzone.errors.unexpectedError"),
          ]),
        );
        console.log("Unexpected error");
        removeImage();
      }
    },
  });

  const inputId = useId();

  return (
    <div className={styles.container}>
      <div className={styles.topRow}>
        <label htmlFor={inputId}>{t("coverImageDropzone.title")}</label>
        {previewImage && <DeleteButton type="button" onClick={removeImage} />}
      </div>
      <div {...getRootProps()} className={styles.dropzone}>
        <input {...getInputProps()} id={inputId} />
        {previewImage ? (
          <Image
            src={previewImage}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={styles.previewImage}
          />
        ) : (
          <p className={styles.dragText}>
            {isDragActive
              ? t("coverImageDropzone.dragActive")
              : t("coverImageDropzone.dragInactive")}
          </p>
        )}
      </div>
      {errors.length > 0 && (
        <p className={styles.errorText}>{errors.join(" ")}</p>
      )}
    </div>
  );
};
