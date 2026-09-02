import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Flow - AI Image and Video Studio",
        short_name: "Flow",
        description: "Open-source AI image and video creation workspace with multi-model generation through APIs.",
        start_url: "/",
        display: "standalone",
        background_color: "#0b0b0b",
        theme_color: "#0b0b0b",
        icons: [
            { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
            { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
        ],
    }
}
