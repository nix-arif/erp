export const uploadLogo = async (file: File) => {
  if (file.type !== "image/svg+xml") {
    throw new Error("Only SVG files allowed");
  }

  // get signed URL
  const res = await fetch("/api/logo/upload-url", {
    method: "POST",
  });

  console.log(res);
  //   const { url, key } = await res.json();

  // upload file to R2
  //   const uploadRes = await fetch(url, {
  //     method: "PUT",
  //     headers: {
  //       "Content-Type": "image/svg+xml",
  //     },
  //     body: file,
  //   });

  //   if (!uploadRes.ok) {
  //     throw new Error("Upload to R2 failed");
  //   }

  //   return key;
};
