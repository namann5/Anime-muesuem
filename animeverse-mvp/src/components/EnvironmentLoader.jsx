import React, { useEffect, useState } from "react";
import { Environment } from "@react-three/drei";

// Simple environment loader that accepts a preset key.
// 'studio' uses a neutral studio HDRI shipped via CDN; 'city' uses a neon city HDRI URL.
export default function EnvironmentLoader({
  preset = "studio",
  background = false,
}) {
  const [files, setFiles] = useState(null);

  useEffect(() => {
    const map = {
      studio:
        "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/studio_small_02_2k.hdr",
      city: "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/cyberpunk_street_02_2k.hdr",
      none: null,
    };
    setFiles(map[preset] || map.studio);
  }, [preset]);

  if (!files) return null;
  return <Environment files={files} background={background} preset={null} />;
}
