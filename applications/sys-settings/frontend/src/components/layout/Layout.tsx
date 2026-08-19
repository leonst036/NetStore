import React from 'react';
import { Box, Card, CardContent, Select, FormGroup, TextField, type BoxProps, type CardProps, type CardContentProps, type SelectProps, type FormGroupProps, type TextFieldProps } from '@netlink/ui';

export const VerticalStack: React.FC<BoxProps> = (props) => (
    <Box className="vertical-stack" {...props} />
);

export const FlexRowSpaceBetween: React.FC<BoxProps> = (props) => (
    <Box className="flex-row-space-between" {...props} />
);

export interface StyledCardProps extends CardProps {
    $mb?: boolean;
}

export const StyledCard: React.FC<StyledCardProps> = ({ $mb, sx, ...props }) => (
    <Card className="styled-card" sx={{ mb: $mb ? 3 : 0, ...sx }} {...props} />
);

export const StyledCardContent: React.FC<CardContentProps> = (props) => (
    <CardContent className="styled-card-content" {...props} />
);

export const StyledSelect: React.FC<SelectProps> = (props) => (
    <Select className="styled-select" {...props} />
);

export const StyledFormGroup: React.FC<FormGroupProps> = (props) => (
    <FormGroup className="styled-form-group" {...props} />
);

export const StyledTextField: React.FC<TextFieldProps> = (props) => (
    <TextField className="styled-text-field" {...props} />
);

export const SectionHeader: React.FC<BoxProps> = (props) => (
    <Box className="section-header" {...props} />
);

export const FormFieldsContainer: React.FC<BoxProps> = (props) => (
    <Box className="form-fields-container" {...props} />
);

export const ButtonActionsContainer: React.FC<BoxProps> = (props) => (
    <Box className="button-actions-container" {...props} />
);

export const StyledTableContainer: React.FC<any> = (props) => (
    <Box className="styled-table-container" {...props} />
);