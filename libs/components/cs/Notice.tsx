import React, { useState, useEffect } from 'react';
import { Stack, Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useQuery } from '@apollo/client';
import { GET_CS_LIST, GET_CS } from '../../../apollo/user/query';
import { CsType } from '../../enums/cs.enum';

const Notice = () => {
	const device = useDeviceDetect();
	const [noticeList, setNoticeList] = useState<any[]>([]);
	const [selectedNoticeId, setSelectedNoticeId] = useState<string | null>(null);
	const [openDialog, setOpenDialog] = useState(false);

	/** APOLLO REQUESTS **/
	const {
		loading: getNoticesLoading,
		data: getNoticesData,
		refetch: getNoticesRefetch,
	} = useQuery(GET_CS_LIST, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: {
				page: 1,
				limit: 50,
				sort: 'createdAt',
				direction: 'DESC',
				search: {
					csType: CsType.NOTICE,
				},
			},
		},
		notifyOnNetworkStatusChange: true,
		onCompleted: (data) => {
			setNoticeList(data?.getCsList?.list || []);
		},
	});

	const { data: noticeDetailData, loading: noticeDetailLoading } = useQuery(GET_CS, {
		skip: !selectedNoticeId,
		fetchPolicy: 'network-only',
		variables: {
			csId: selectedNoticeId,
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (noticeDetailData?.getCs && openDialog) {
			// Data is ready
		}
	}, [noticeDetailData, openDialog]);

	/** HANDLERS **/
	const handleNoticeClick = (noticeId: string) => {
		setSelectedNoticeId(noticeId);
		setOpenDialog(true);
	};

	const handleCloseDialog = () => {
		setOpenDialog(false);
		setSelectedNoticeId(null);
	};

	if (device === 'mobile') {
		return <div>NOTICE MOBILE</div>;
	} else {
		return (
			<>
				<Stack className={'notice-content'}>
					<span className={'title'}>Notice</span>
					<Stack className={'main'}>
						<Box component={'div'} className={'top'}>
							<span>number</span>
							<span>title</span>
							<span>date</span>
						</Box>
						<Stack className={'bottom'}>
							{noticeList.map((notice: any, index: number) => (
								<div
									className={`notice-card ${notice?.csEvent && 'event'} cursor-pointer`}
									key={notice._id}
									onClick={() => handleNoticeClick(notice._id)}
									style={{ cursor: 'pointer' }}
								>
									{notice?.csEvent ? <div>event</div> : <span className={'notice-number'}>{index + 1}</span>}
									<span className={'notice-title'}>{notice.csTitle}</span>
									<span className={'notice-date'}>
										{notice.createdAt ? new Date(notice.createdAt).toLocaleDateString() : '-'}
									</span>
								</div>
							))}
						</Stack>
					</Stack>
				</Stack>

				{/* Notice Detail Dialog */}
				<Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
					<DialogTitle>
						{noticeDetailLoading ? 'Loading...' : noticeDetailData?.getCs?.csTitle || 'Notice Details'}
					</DialogTitle>
					<DialogContent dividers>
						{noticeDetailLoading ? (
							<Typography>Loading notice details...</Typography>
						) : noticeDetailData?.getCs ? (
							<Stack spacing={2}>
								<Box>
									<Typography variant="caption" color="textSecondary">
										Category: {noticeDetailData.getCs.csCategory}
									</Typography>
									<Typography variant="caption" color="textSecondary" sx={{ ml: 2 }}>
										Date:{' '}
										{noticeDetailData.getCs.createdAt
											? new Date(noticeDetailData.getCs.createdAt).toLocaleDateString()
											: '-'}
									</Typography>
								</Box>
								<Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
									{noticeDetailData.getCs.csContent}
								</Typography>
							</Stack>
						) : (
							<Typography>No details available</Typography>
						)}
					</DialogContent>
					<DialogActions>
						<Button onClick={handleCloseDialog}>Close</Button>
					</DialogActions>
				</Dialog>
			</>
		);
	}
};

export default Notice;
