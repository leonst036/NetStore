import { Box, Typography, Paper } from '@mui/material';
import { WindowLayout } from '@netlink/ui';

export default function App() {
  return (
    <WindowLayout>
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
            textAlign: 'center',
            backgroundColor: '#0f172a',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, color: '#f8fafc' }}>
            Hello World
          </Typography>
          <Typography variant="body1" sx={{ color: '#94a3b8' }}>
            NetConnect Manager Frontend
          </Typography>
        </Paper>
      </Box>
    </WindowLayout>
  );
}
