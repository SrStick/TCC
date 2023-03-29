import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { visualizer } from "rollup-plugin-visualizer"


export default defineConfig({
	esbuild: {
		legalComments: 'none',
		treeShaking: true
	},
	plugins: [react(), visualizer()],
})
