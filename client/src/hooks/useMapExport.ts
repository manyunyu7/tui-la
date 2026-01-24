import { useCallback, useState } from 'react'
import html2canvas from 'html2canvas'

interface UseMapExportOptions {
  mapContainerId?: string
  filename?: string
}

export function useMapExport({ mapContainerId = 'map-container', filename = 'map-export' }: UseMapExportOptions = {}) {
  const [isExporting, setIsExporting] = useState(false)

  const exportAsImage = useCallback(async () => {
    const mapContainer = document.getElementById(mapContainerId)
    if (!mapContainer) {
      console.error('Map container not found')
      return null
    }

    setIsExporting(true)

    try {
      // Temporarily hide UI elements that shouldn't be in the export
      const controls = mapContainer.querySelectorAll('.leaflet-control-container, .absolute')
      const hiddenElements: { element: HTMLElement; display: string }[] = []

      controls.forEach((el) => {
        const htmlEl = el as HTMLElement
        if (!htmlEl.classList.contains('leaflet-tile-container') &&
            !htmlEl.classList.contains('leaflet-marker-pane') &&
            !htmlEl.classList.contains('leaflet-overlay-pane')) {
          hiddenElements.push({ element: htmlEl, display: htmlEl.style.display })
          htmlEl.style.display = 'none'
        }
      })

      // Wait for tiles to load
      await new Promise(resolve => setTimeout(resolve, 100))

      // Capture the map
      const canvas = await html2canvas(mapContainer, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#f5f5f5',
        scale: 2, // Higher resolution
        logging: false,
      })

      // Restore hidden elements
      hiddenElements.forEach(({ element, display }) => {
        element.style.display = display
      })

      return canvas
    } catch (error) {
      console.error('Failed to export map:', error)
      return null
    } finally {
      setIsExporting(false)
    }
  }, [mapContainerId])

  const downloadImage = useCallback(async (format: 'png' | 'jpeg' = 'png') => {
    const canvas = await exportAsImage()
    if (!canvas) return false

    try {
      const link = document.createElement('a')
      link.download = `${filename}-${new Date().toISOString().split('T')[0]}.${format}`
      link.href = canvas.toDataURL(`image/${format}`, format === 'jpeg' ? 0.9 : undefined)
      link.click()
      return true
    } catch (error) {
      console.error('Failed to download image:', error)
      return false
    }
  }, [exportAsImage, filename])

  const copyToClipboard = useCallback(async () => {
    const canvas = await exportAsImage()
    if (!canvas) return false

    try {
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/png')
      })

      if (!blob) return false

      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      return true
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      return false
    }
  }, [exportAsImage])

  return {
    isExporting,
    downloadImage,
    copyToClipboard,
    exportAsImage,
  }
}
