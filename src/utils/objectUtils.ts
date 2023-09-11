import type { PostPolicyResult } from "minio";

export const formDataFromS3PostPolicy = (
  fields: PostPolicyResult["formData"],
  file: File,
) => {
  const formData = new FormData();

  for (const [key, value] of Object.entries(fields)) {
    if (typeof value === "string" || value instanceof Blob) {
      formData.append(key, value);
    } else {
      console.warn(
        "This should never happen. Value in post policy is not a string or blob,",
        value,
      );
    }
  }

  formData.append("file", file);

  return formData;
};
