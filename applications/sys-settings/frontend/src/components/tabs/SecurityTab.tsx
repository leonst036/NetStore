import { Box, Typography, Card, CardContent, FormGroup, Chip, Divider } from '@mui/material'

export interface SecurityTabProbs {
    activeTab: string;
}

const StyledCard = ({ $mb, ...props }: any) => (
    <Card className="styled-card" sx={{ mb: $mb ? 3 : 0 }} {...props} />
);
const StyledCardContent = (props: any) => <CardContent className="styled-card-content" {...props} />;
const StyledFormGroup = (props: any) => <FormGroup className="styled-form-group" {...props} />;
const FlexRowSpaceBetween = (props: any) => <Box className="flex-row-space-between" {...props} />;

export const SecurityTab = ({ activeTab }: SecurityTabProbs) => {
    return (
        <>
            {activeTab === 'security' && (
                <Box>
                    <Typography variant="h5" className="section-title">Security & Credentials</Typography>

                    <StyledCard variant="outlined" $mb>
                        <StyledCardContent>
                            <Typography variant="subtitle2" className="card-subtitle">Session Security</Typography>
                            <StyledFormGroup>
                                <FlexRowSpaceBetween>
                                    <Box>
                                        <Typography sx={{ fontWeight: 500 }}>Ticket-Based Sandbox Auth</Typography>
                                        <Typography variant="body2" color="text.secondary">Enforce isolated cryptographic tickets for application iframes</Typography>
                                    </Box>
                                    <Chip label="ACTIVE" color="success" size="small" className="styled-chip" />
                                </FlexRowSpaceBetween>
                                <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.05)' }} />
                                <FlexRowSpaceBetween>
                                    <Box>
                                        <Typography sx={{ fontWeight: 500 }}>Relay Channel Encryption</Typography>
                                        <Typography variant="body2" color="text.secondary">TLS tunnel transport between Relay Server and Local Server</Typography>
                                    </Box>
                                    <Chip label="ENABLED" color="primary" size="small" className="styled-chip" />
                                </FlexRowSpaceBetween>
                            </StyledFormGroup>
                        </StyledCardContent>
                    </StyledCard>
                </Box>
            )}
        </>
    )
}