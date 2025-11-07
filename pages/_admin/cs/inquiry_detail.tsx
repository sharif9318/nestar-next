import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import {
	Box,
	Button,
	Stack,
	TextField,
	Typography,
	Alert,
	Paper,
	Chip,
	Divider,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
} from '@mui/material';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@apollo/client';
import { UPDATE_CS_BY_ADMIN } from '../../../apollo/admin/mutation';
import { GET_CS } from '../../../apollo/user/query';
import { InquiryStatus } from '../../../libs/enums/cs.enum';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../../libs/sweetAlert';

const InquiryDetail: NextPage = () => {
	const router = useRouter();
	const { id } = router.query as { id?: string };

	const [answer, setAnswer] = useState('');
	const [status, setStatus] = useState<InquiryStatus>(InquiryStatus.PENDING);

	/** APOLLO REQUESTS **/
	const {
		data: inquiryData,
		loading: inquiryLoading,
		refetch,
	} = useQuery(GET_CS, {
		skip: !id,
		fetchPolicy: 'network-only',
		variables: {
			csId: id,
		},
		onCompleted: (data) => {
			if (data?.getCs) {
				setAnswer(data.getCs.csAnswer || '');
				setStatus(data.getCs.inquiryStatus || InquiryStatus.PENDING);
			}
		},
	});

	const [updateCsByAdmin, { loading: updateLoading }] = useMutation(UPDATE_CS_BY_ADMIN, {
		refetchQueries: ['GetAllCs', 'GetCs'],
		awaitRefetchQueries: true,
	});

	/** LIFECYCLES **/
	useEffect(() => {
		// Auto-change status to ANSWERED when answer is provided and status is PENDING
		if (answer.trim() && status === InquiryStatus.PENDING) {
			setStatus(InquiryStatus.ANSWERED);
		}
	}, [answer]);

	/** HANDLERS **/
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!answer.trim()) {
			await sweetErrorHandling('Please enter an answer');
			return;
		}

		try {
			const result = await updateCsByAdmin({
				variables: {
					input: {
						_id: id,
						csAnswer: answer,
						inquiryStatus: status,
					},
				},
			});

			// Update local state immediately
			if (result.data?.updateCsByAdmin) {
				setStatus(result.data.updateCsByAdmin.inquiryStatus);
				setAnswer(result.data.updateCsByAdmin.csAnswer || answer);
			}

			await sweetTopSmallSuccessAlert('Answer submitted successfully!', 1500);

			// Refetch to ensure consistency
			await refetch();
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const handleBack = () => {
		router.push('/_admin/cs/inquiry');
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case InquiryStatus.PENDING:
				return 'warning';
			case InquiryStatus.ANSWERED:
				return 'success';
			case InquiryStatus.CLOSED:
				return 'default';
			default:
				return 'default';
		}
	};

	if (inquiryLoading) {
		return (
			<Box component={'div'} className={'content'}>
				<Alert severity="info">Loading inquiry details...</Alert>
			</Box>
		);
	}

	if (!inquiryData?.getCs) {
		return (
			<Box component={'div'} className={'content'}>
				<Alert severity="error">Inquiry not found</Alert>
				<Button onClick={handleBack} sx={{ mt: 2 }}>
					Back to Inquiries
				</Button>
			</Box>
		);
	}

	const inquiry = inquiryData.getCs;

	return (
		<Box component={'div'} className={'content'}>
			<Box component={'div'} className={'title flex_space'} sx={{ mb: 4 }}>
				<Typography variant={'h2'}>Inquiry Details</Typography>
				<Button variant="outlined" onClick={handleBack} sx={{ borderRadius: 2 }}>
					← Back to List
				</Button>
			</Box>

			<Stack spacing={4}>
				{/* Inquiry Information */}
				<Paper elevation={3} sx={{ p: 4, borderRadius: 2, border: '1px solid #e0e0e0' }}>
					<Stack spacing={3}>
						<Box
							display="flex"
							justifyContent="space-between"
							alignItems="center"
							sx={{ pb: 2, borderBottom: '2px solid #f5f5f5' }}
						>
							<Typography variant="h4" fontWeight={600} color="primary">
								{inquiry.csTitle}
							</Typography>
							<Chip
								label={status || 'PENDING'}
								color={getStatusColor(status)}
								sx={{ fontWeight: 600, px: 2, py: 2.5, fontSize: '0.875rem' }}
							/>
						</Box>

						<Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', py: 1 }}>
							<Box>
								<Typography variant="caption" color="textSecondary" fontWeight={600} display="block">
									CATEGORY
								</Typography>
								<Typography variant="body1" fontWeight={500}>
									{inquiry.csCategory}
								</Typography>
							</Box>
							<Box>
								<Typography variant="caption" color="textSecondary" fontWeight={600} display="block">
									SUBMITTED
								</Typography>
								<Typography variant="body1" fontWeight={500}>
									{inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleString() : '-'}
								</Typography>
							</Box>
							<Box>
								<Typography variant="caption" color="textSecondary" fontWeight={600} display="block">
									FROM
								</Typography>
								<Typography variant="body1" fontWeight={500}>
									{inquiry.memberData?.memberNick || 'Unknown User'}
									<Typography component="span" variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
										({inquiry.memberData?.memberType || 'USER'})
									</Typography>
								</Typography>
							</Box>
						</Box>

						<Box sx={{ mt: 2 }}>
							<Typography variant="subtitle1" fontWeight={600} gutterBottom color="text.primary">
								User's Message:
							</Typography>
							<Box
								sx={{
									whiteSpace: 'pre-wrap',
									p: 3,
									bgcolor: '#f8f9fa',
									borderRadius: 2,
									border: '1px solid #e9ecef',
									minHeight: 100,
								}}
							>
								<Typography variant="body1" lineHeight={1.8}>
									{inquiry.csContent}
								</Typography>
							</Box>
						</Box>
					</Stack>
				</Paper>

				{/* Answer Section */}
				<Paper elevation={3} sx={{ p: 4, borderRadius: 2, border: '1px solid #e0e0e0', bgcolor: '#fafafa' }}>
					<Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
						Provide Answer
					</Typography>

					{inquiry.csAnswer && inquiry.answeredAt && (
						<Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
							<Typography variant="body2" fontWeight={500}>
								Previously answered on: {new Date(inquiry.answeredAt).toLocaleString()}
							</Typography>
						</Alert>
					)}

					<Box component="form" onSubmit={handleSubmit}>
						<Stack spacing={3}>
							<FormControl fullWidth>
								<InputLabel sx={{ fontWeight: 600 }}>Status</InputLabel>
								<Select
									value={status}
									label="Status"
									onChange={(e) => setStatus(e.target.value as InquiryStatus)}
									sx={{ bgcolor: 'white', borderRadius: 2 }}
								>
									<MenuItem value={InquiryStatus.PENDING}>🟡 Pending</MenuItem>
									<MenuItem value={InquiryStatus.ANSWERED}>🟢 Answered</MenuItem>
									<MenuItem value={InquiryStatus.CLOSED}>⚫ Closed</MenuItem>
								</Select>
							</FormControl>

							<Box>
								<Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ mb: 1 }}>
									Answer{' '}
									<Typography component="span" color="error">
										*
									</Typography>
								</Typography>
								<TextField
									fullWidth
									required
									multiline
									rows={10}
									value={answer}
									onChange={(e) => setAnswer(e.target.value)}
									placeholder="Enter your answer to this inquiry"
									sx={{
										bgcolor: 'white',
										'& .MuiOutlinedInput-root': {
											borderRadius: 2,
											fontSize: '1rem',
											lineHeight: 1.8,
										},
									}}
								/>
							</Box>

							<Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
								<Button
									type="submit"
									variant="contained"
									size="large"
									disabled={updateLoading || !answer.trim()}
									sx={{
										minWidth: 180,
										py: 1.5,
										borderRadius: 2,
										fontWeight: 600,
										fontSize: '1rem',
										textTransform: 'none',
										boxShadow: 2,
									}}
								>
									{updateLoading ? 'Submitting...' : '✓ Submit Answer'}
								</Button>
								<Button
									variant="outlined"
									size="large"
									onClick={handleBack}
									sx={{
										minWidth: 120,
										py: 1.5,
										borderRadius: 2,
										fontWeight: 600,
										textTransform: 'none',
									}}
								>
									Cancel
								</Button>
							</Box>
						</Stack>
					</Box>
				</Paper>
			</Stack>
		</Box>
	);
};

export default withAdminLayout(InquiryDetail);
