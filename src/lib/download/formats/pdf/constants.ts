// PDF formatting constants
export const PDF_CONFIG = {
  pageSize: {
    width: 595, // A4 width in points
    height: 842  // A4 height in points
  },
  margins: {
    top: 72,    // 1 inch
    bottom: 72,
    left: 72,
    right: 72
  },
  fonts: {
    body: {
      size: 11,
      lineHeight: 1.5
    },
    header: {
      size: 14,
      lineHeight: 1.2
    }
  }
} as const;