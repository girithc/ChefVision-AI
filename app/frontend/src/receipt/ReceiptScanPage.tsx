import React, { useRef, useState } from 'react'
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  Paper,
  Toolbar,
  Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined'
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'

export default function ReceiptScanPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const cameraInputRef = useRef<HTMLInputElement | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    setSelectedFile(file)
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0] || null
    setSelectedFile(file)
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f6f7fb' }}>
      {/* Top Navbar */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: '#fff',
          color: '#111827',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 4 }, minHeight: 72 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                border: '2px solid #2563eb',
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ReceiptLongOutlinedIcon
                sx={{ color: '#2563eb', fontSize: 22 }}
              />
            </Box>

            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: '1.75rem',
                letterSpacing: '-0.02em',
              }}
            >
              ChefVison AI
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Inventory2OutlinedIcon sx={{ fontSize: 20 }} />
              <Typography sx={{ fontWeight: 600 }}>Item Library</Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpOutlinedIcon sx={{ fontSize: 20 }} />
              <Typography sx={{ fontWeight: 600 }}>Forecasting</Typography>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="md" sx={{ pt: 8 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
          <IconButton
            sx={{
              mt: 0.5,
              color: '#111827',
            }}
          >
            <ArrowBackIcon />
          </IconButton>

          <Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '2rem', md: '3rem' },
                lineHeight: 1.1,
                color: '#0f172a',
              }}
            >
              Scan Receipt
            </Typography>

            <Typography
              sx={{
                mt: 1,
                fontSize: '1.15rem',
                color: '#475569',
              }}
            >
              Upload a photo of your receipt
            </Typography>
          </Box>
        </Box>

        <Paper
          elevation={0}
          sx={{
            mt: 4,
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            border: '1px solid #e5e7eb',
            bgcolor: '#fff',
          }}
        >
          {/* Upload Area */}
          <Box
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            sx={{
              border: '2px dashed #cbd5e1',
              borderRadius: 3,
              minHeight: 280,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              px: 3,
              transition: '0.2s ease',
              '&:hover': {
                borderColor: '#94a3b8',
                bgcolor: '#fafafa',
              },
            }}
          >
            <UploadFileOutlinedIcon
              sx={{
                fontSize: 72,
                color: '#94a3b8',
                mb: 2,
              }}
            />

            <Typography
              sx={{
                fontSize: '1.75rem',
                fontWeight: 600,
                color: '#334155',
              }}
            >
              Click to upload or drag and drop
            </Typography>

            <Typography
              sx={{
                mt: 1.5,
                fontSize: '1.25rem',
                color: '#64748b',
                fontWeight: 500,
              }}
            >
              PNG, JPG or PDF (MAX. 10MB)
            </Typography>

            {selectedFile && (
              <Typography
                sx={{
                  mt: 3,
                  fontSize: '1rem',
                  color: '#2563eb',
                  fontWeight: 600,
                }}
              >
                Selected: {selectedFile.name}
              </Typography>
            )}
          </Box>

          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept=".png,.jpg,.jpeg,.pdf,image/*,application/pdf"
            onChange={handleFileChange}
          />

          {/* Divider */}
          <Box sx={{ display: 'flex', alignItems: 'center', my: 4 }}>
            <Divider sx={{ flex: 1 }} />
            <Typography sx={{ px: 2, color: '#6b7280', fontSize: '1rem' }}>
              Or use camera
            </Typography>
            <Divider sx={{ flex: 1 }} />
          </Box>

          {/* Camera Button */}
          <Button
            fullWidth
            variant="outlined"
            startIcon={<CameraAltOutlinedIcon />}
            onClick={() => cameraInputRef.current?.click()}
            sx={{
              height: 56,
              borderRadius: 2.5,
              textTransform: 'none',
              fontSize: '1.1rem',
              fontWeight: 600,
              color: '#111827',
              borderColor: '#d1d5db',
              '&:hover': {
                borderColor: '#9ca3af',
                bgcolor: '#fafafa',
              },
            }}
          >
            Take Photo
          </Button>

          <input
            ref={cameraInputRef}
            type="file"
            hidden
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
          />
        </Paper>
      </Container>
    </Box>
  )
}
