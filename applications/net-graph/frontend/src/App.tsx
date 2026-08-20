import { Box, WindowLayout } from '@netlink/ui';
import NetworkGraph from './NetworkGraph';
import { useTicket, useNetworkScan } from './hooks';
import { launchTerminal, launchVNC, launchSFTP } from './bridge/netlinkBridge';

export default function App() {
  const ticket = useTicket();
  const { devices, isScanning, scan } = useNetworkScan(ticket);

  return (
    <WindowLayout>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
        <NetworkGraph
          devices={devices}
          isScanning={isScanning}
          onScanClick={() => scan(true)}
          ticket={ticket}
          onNodeClick={launchTerminal}
          onVncClick={launchVNC}
          onSftpClick={launchSFTP}
        />
      </Box>
    </WindowLayout>
  );
}
