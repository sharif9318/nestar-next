import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
	TableCell,
	TableHead,
	TableBody,
	TableRow,
	Table,
	TableContainer,
	Button,
	Menu,
	Fade,
	MenuItem,
	Box,
	Checkbox,
	Toolbar,
} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { IconButton, Tooltip } from '@mui/material';
import Typography from '@mui/material/Typography';
import { Stack } from '@mui/material';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { NotePencil } from 'phosphor-react';
import { useMutation, useQuery } from '@apollo/client';
import { GET_ALL_CS } from '../../../../apollo/admin/query';
import { REMOVE_CS_BY_ADMIN } from '../../../../apollo/admin/mutation';
import { CsType } from '../../../enums/cs.enum';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../../sweetAlert';

type Order = 'asc' | 'desc';

interface Data {
	category: string;
	title: string;
	id: string;
	writer: string;
	date: string;
	view: number;
	action: string;
}
interface HeadCell {
	disablePadding: boolean;
	id: keyof Data;
	label: string;
	numeric: boolean;
}

const headCells: readonly HeadCell[] = [
	{
		id: 'category',
		numeric: true,
		disablePadding: false,
		label: 'Category',
	},
	{
		id: 'title',
		numeric: true,
		disablePadding: false,
		label: 'TITLE',
	},
	{
		id: 'id',
		numeric: true,
		disablePadding: false,
		label: 'ID',
	},
	{
		id: 'writer',
		numeric: true,
		disablePadding: false,
		label: 'WRITER',
	},
	{
		id: 'date',
		numeric: true,
		disablePadding: false,
		label: 'DATE',
	},
	{
		id: 'view',
		numeric: true,
		disablePadding: false,
		label: 'VIEW',
	},
	{
		id: 'action',
		numeric: false,
		disablePadding: false,
		label: 'ACTION',
	},
];

interface EnhancedTableProps {
	numSelected: number;
	onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Data) => void;
	onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
	order: Order;
	orderBy: string;
	rowCount: number;
}

interface EnhancedTableToolbarProps {
	numSelected: number;
	onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Data) => void;
	onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
	order: Order;
	orderBy: string;
	rowCount: number;
}

const EnhancedTableToolbar = (props: EnhancedTableToolbarProps) => {
	const [select, setSelect] = useState('');
	const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;

	return (
		<>
			{numSelected > 0 ? (
				<>
					<Toolbar>
						<Box component={'div'}>
							<Box component={'div'} className="flex_box">
								<Checkbox
									color="primary"
									indeterminate={numSelected > 0 && numSelected < rowCount}
									checked={rowCount > 0 && numSelected === rowCount}
									onChange={onSelectAllClick}
									inputProps={{
										'aria-label': 'select all',
									}}
								/>
								<Typography sx={{ flex: '1 1 100%' }} color="inherit" variant="h6" component="div">
									{numSelected} selected
								</Typography>
							</Box>
							<Button variant={'text'} size={'large'}>
								Delete
							</Button>
						</Box>
					</Toolbar>
				</>
			) : (
				<TableHead>
					<TableRow>
						<TableCell padding="checkbox">
							<Checkbox
								color="primary"
								indeterminate={numSelected > 0 && numSelected < rowCount}
								checked={rowCount > 0 && numSelected === rowCount}
								onChange={onSelectAllClick}
								inputProps={{
									'aria-label': 'select all',
								}}
							/>
						</TableCell>
						{headCells.map((headCell) => (
							<TableCell
								key={headCell.id}
								align={headCell.numeric ? 'left' : 'right'}
								padding={headCell.disablePadding ? 'none' : 'normal'}
							>
								{headCell.label}
							</TableCell>
						))}
					</TableRow>
				</TableHead>
			)}
			{numSelected > 0 ? null : null}
		</>
	);
};

interface NoticeListType {
	dense?: boolean;
	searchNotices?: any;
}

export const NoticeList = (props: NoticeListType) => {
	const { dense, searchNotices } = props;
	const router = useRouter();
	const [noticeList, setNoticeList] = useState<any[]>([]);

	/** APOLLO REQUESTS **/
	const {
		loading: getNoticesLoading,
		data: getNoticesData,
		error: getNoticesError,
		refetch: getNoticesRefetch,
	} = useQuery(GET_ALL_CS, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				page: 1,
				limit: 10,
				sort: 'createdAt',
				direction: 'DESC',
				search: {
					csType: CsType.NOTICE,
					...searchNotices,
				},
			},
		},
		notifyOnNetworkStatusChange: true,
		onCompleted: (data) => {
			setNoticeList(data?.getAllCs?.list || []);
		},
	});

	const [removeCsByAdmin] = useMutation(REMOVE_CS_BY_ADMIN);

	/** LIFECYCLES **/
	useEffect(() => {
		if (searchNotices) {
			getNoticesRefetch({
				input: {
					page: 1,
					limit: 10,
					sort: 'createdAt',
					direction: 'DESC',
					search: {
						csType: CsType.NOTICE,
						...searchNotices,
					},
				},
			});
		}
	}, [searchNotices]);

	/** HANDLERS **/
	const handleEditClick = (noticeId: string) => {
		router.push(`/_admin/cs/notice_create?id=${noticeId}`);
	};

	const handleDeleteClick = async (noticeId: string) => {
		try {
			if (confirm('Are you sure you want to delete this notice?')) {
				await removeCsByAdmin({
					variables: {
						csId: noticeId,
					},
				});
				await sweetTopSmallSuccessAlert('Notice deleted successfully!', 800);
				getNoticesRefetch();
			}
		} catch (err) {
			sweetErrorHandling(err).then();
		}
	};

	return (
		<Stack>
			<TableContainer>
				<Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size={dense ? 'small' : 'medium'}>
					{/*@ts-ignore*/}
					<EnhancedTableToolbar />
					<TableBody>
						{noticeList?.map((notice: any, index: number) => {
							const member_image = notice?.memberData?.memberImage || '/img/profile/defaultUser.svg';

							return (
								<TableRow hover key={notice._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
									<TableCell padding="checkbox">
										<Checkbox color="primary" />
									</TableCell>
									<TableCell align="left">{notice.csCategory}</TableCell>
									<TableCell align="left">
										<Link href={`/_admin/cs/notice_create?id=${notice._id}`}>
											<div className={'title-cell'}>{notice.csTitle}</div>
										</Link>
									</TableCell>
									<TableCell align="left">{notice._id.slice(-6)}</TableCell>
									<TableCell align="left" className={'name'}>
										<Stack direction={'row'} alignItems={'center'}>
											<Avatar alt={notice?.memberData?.memberNick} src={member_image} sx={{ ml: '2px', mr: '10px' }} />
											<div>{notice?.memberData?.memberNick || 'Admin'}</div>
										</Stack>
									</TableCell>
									<TableCell align="left">
										{notice.createdAt ? new Date(notice.createdAt).toLocaleDateString() : '-'}
									</TableCell>
									<TableCell align="left">{notice.csEvent ? 'Event' : 'Normal'}</TableCell>
									<TableCell align="right">
										<Tooltip title={'delete'}>
											<IconButton onClick={() => handleDeleteClick(notice._id)}>
												<DeleteRoundedIcon />
											</IconButton>
										</Tooltip>
										<Tooltip title="edit">
											<IconButton onClick={() => handleEditClick(notice._id)}>
												<NotePencil size={24} weight="fill" />
											</IconButton>
										</Tooltip>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</TableContainer>
		</Stack>
	);
};
