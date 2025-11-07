import React, { useState, useEffect } from 'react';
import {
	Stack,
	Box,
	Paper,
	Typography,
	Chip,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Alert,
} from '@mui/material';
import { useQuery } from '@apollo/client';
import { GET_CS_LIST } from '../../../apollo/user/query';
import { CsType, InquiryStatus } from '../../enums/cs.enum';
import useDeviceDetect from '../../hooks/useDeviceDetect';

const UserInquiryList = () => {
	const device = useDeviceDetect();
	const [inquiryList, setInquiryList] = useState<any[]>([]);
	const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
	const [openDialog, setOpenDialog] = useState(false);

	/** APOLLO REQUESTS **/
	const {
		loading: getInquiriesLoading,
		data: getInquiriesData,
		refetch: getInquiriesRefetch,
	} = useQuery(GET_CS_LIST, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: {
				page: 1,
				limit: 50,
				sort: 'createdAt',
				direction: 'DESC',
				search: {
					csType: CsType.INQUIRY,
				},
			},
		},
		notifyOnNetworkStatusChange: true,
		onCompleted: (data) => {
			setInquiryList(data?.getCsList?.list || []);
		},
	});

	/** LIFECYCLES **/
	/** HANDLERS **/
	const handleInquiryClick = (inquiry: any) => {
		setSelectedInquiry(inquiry);
		setOpenDialog(true);
	};

	const handleCloseDialog = () => {
		setOpenDialog(false);
		setSelectedInquiry(null);
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

	if (device === 'mobile') {
		return <div>Inquiry List MOBILE</div>;
	}

	return (
		<>
			<Stack className={'inquiry-list-content'} spacing={4}>
				<Box sx={{ textAlign: 'center', py: 2 }}>
					<Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>
						My Inquiries
					</Typography>
					<Typography variant="body2" color="textSecondary">
						Track your inquiries and view responses from our support team
					</Typography>
				</Box>

				{getInquiriesLoading ? (
					<Alert severity="info" sx={{ borderRadius: 2 }}>
						Loading your inquiries...
					</Alert>
				) : inquiryList.length === 0 ? (
					<Paper elevation={0} sx={{ p: 6, textAlign: 'center', bgcolor: 'grey.50', borderRadius: 3 }}>
						<Typography variant="h6" color="textSecondary" gutterBottom>
							No Inquiries Yet
						</Typography>
						<Typography variant="body2" color="textSecondary">
							You haven't submitted any inquiries. Visit the "Submit Inquiry" tab to ask a question.
						</Typography>
					</Paper>
				) : (
					<Stack spacing={3}>
						{inquiryList.map((inquiry: any) => (
							<Paper
								key={inquiry._id}
								elevation={3}
								sx={{
									p: 3,
									cursor: 'pointer',
									transition: 'all 0.3s',
									border: '1px solid',
									borderColor: 'grey.200',
									borderRadius: 2,
									'&:hover': {
										bgcolor: 'grey.50',
										transform: 'translateY(-2px)',
										boxShadow: 6,
									},
								}}
								onClick={() => handleInquiryClick(inquiry)}
							>
								<Stack spacing={2}>
									<Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
										<Box flex={1}>
											<Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
												{inquiry.csTitle}
											</Typography>
											<Stack direction="row" spacing={2} flexWrap="wrap">
												<Typography
													variant="caption"
													color="textSecondary"
													sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
												>
													📁 {inquiry.csCategory}
												</Typography>
												<Typography
													variant="caption"
													color="textSecondary"
													sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
												>
													📅 {inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleDateString() : '-'}
												</Typography>
												{inquiry.answeredAt && (
													<Typography
														variant="caption"
														color="success.main"
														sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
													>
														✓ Answered on {new Date(inquiry.answeredAt).toLocaleDateString()}
													</Typography>
												)}
											</Stack>
										</Box>
										<Chip
											label={inquiry.inquiryStatus || 'PENDING'}
											color={getStatusColor(inquiry.inquiryStatus)}
											sx={{ fontWeight: 600 }}
										/>
									</Stack>

									<Typography
										variant="body2"
										color="textSecondary"
										sx={{
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											display: '-webkit-box',
											WebkitLineClamp: 2,
											WebkitBoxOrient: 'vertical',
										}}
									>
										{inquiry.csContent}
									</Typography>

									<Button
										variant="text"
										size="small"
										sx={{ alignSelf: 'flex-start', textTransform: 'none', fontWeight: 600 }}
									>
										View Details →
									</Button>
								</Stack>
							</Paper>
						))}
					</Stack>
				)}
			</Stack>

			{/* Inquiry Detail Dialog */}
			<Dialog
				open={openDialog}
				onClose={handleCloseDialog}
				maxWidth="md"
				fullWidth
				PaperProps={{
					sx: { borderRadius: 3 },
				}}
			>
				<DialogTitle sx={{ pb: 2, pt: 3 }}>
					<Stack direction="row" justifyContent="space-between" alignItems="center">
						<Typography variant="h5" fontWeight={600}>
							{selectedInquiry?.csTitle || 'Inquiry Details'}
						</Typography>
						<Chip
							label={selectedInquiry?.inquiryStatus || 'PENDING'}
							color={getStatusColor(selectedInquiry?.inquiryStatus)}
							sx={{ fontWeight: 600, px: 1.5 }}
						/>
					</Stack>
				</DialogTitle>
				<DialogContent dividers sx={{ py: 3 }}>
					{selectedInquiry ? (
						<Stack spacing={4}>
							{/* Metadata */}
							<Stack direction="row" spacing={3} flexWrap="wrap">
								<Box>
									<Typography variant="caption" color="textSecondary" fontWeight={600} display="block">
										CATEGORY
									</Typography>
									<Typography variant="body2" fontWeight={500}>
										{selectedInquiry.csCategory}
									</Typography>
								</Box>
								<Box>
									<Typography variant="caption" color="textSecondary" fontWeight={600} display="block">
										SUBMITTED
									</Typography>
									<Typography variant="body2" fontWeight={500}>
										{selectedInquiry.createdAt ? new Date(selectedInquiry.createdAt).toLocaleString() : '-'}
									</Typography>
								</Box>
								{selectedInquiry.answeredAt && (
									<Box>
										<Typography variant="caption" color="textSecondary" fontWeight={600} display="block">
											ANSWERED
										</Typography>
										<Typography variant="body2" fontWeight={500} color="success.main">
											{new Date(selectedInquiry.answeredAt).toLocaleString()}
										</Typography>
									</Box>
								)}
							</Stack>

							{/* Question */}
							<Box>
								<Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 1.5 }}>
									Your Question:
								</Typography>
								<Paper
									elevation={0}
									sx={{
										whiteSpace: 'pre-wrap',
										p: 3,
										bgcolor: 'grey.50',
										borderRadius: 2,
										border: '1px solid',
										borderColor: 'grey.200',
									}}
								>
									<Typography variant="body1" lineHeight={1.8}>
										{selectedInquiry.csContent}
									</Typography>
								</Paper>
							</Box>

							{/* Answer */}
							{selectedInquiry.csAnswer ? (
								<Box>
									<Typography variant="subtitle1" fontWeight={600} gutterBottom color="primary" sx={{ mb: 1.5 }}>
										✓ Answer from Support Team:
									</Typography>
									<Paper
										elevation={0}
										sx={{
											whiteSpace: 'pre-wrap',
											p: 3,
											bgcolor: 'primary.50',
											borderRadius: 2,
											border: '2px solid',
											borderColor: 'primary.main',
										}}
									>
										<Typography variant="body1" lineHeight={1.8}>
											{selectedInquiry.csAnswer}
										</Typography>
									</Paper>
								</Box>
							) : (
								<Alert
									severity="info"
									sx={{
										borderRadius: 2,
										'& .MuiAlert-message': {
											width: '100%',
										},
									}}
								>
									<Typography variant="body2" fontWeight={500}>
										⏳ Your inquiry is being processed
									</Typography>
									<Typography variant="caption">
										Our support team will respond as soon as possible. You'll be notified when an answer is available.
									</Typography>
								</Alert>
							)}
						</Stack>
					) : (
						<Typography>No details available</Typography>
					)}
				</DialogContent>
				<DialogActions sx={{ p: 2.5 }}>
					<Button
						onClick={handleCloseDialog}
						variant="contained"
						sx={{
							minWidth: 120,
							borderRadius: 2,
							textTransform: 'none',
							fontWeight: 600,
						}}
					>
						Close
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

export default UserInquiryList;
