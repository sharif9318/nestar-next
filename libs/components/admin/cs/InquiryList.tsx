import React, { useEffect, useState } from 'react';
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
	Chip,
} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { Stack } from '@mui/material';
import { useQuery } from '@apollo/client';
import { GET_ALL_CS } from '../../../../apollo/admin/query';
import { CsType } from '../../../enums/cs.enum';

interface Data {
	category: string;
	qna_case_status: string;
	title: string;
	writer: string;
	date: string;
	status: string;
	id?: string;
}

type Order = 'asc' | 'desc';

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
		label: 'CATEGORY',
	},
	{
		id: 'title',
		numeric: true,
		disablePadding: false,
		label: 'TITLE',
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
		id: 'qna_case_status',
		numeric: false,
		disablePadding: false,
		label: 'QNA STATUS',
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

function EnhancedTableHead(props: EnhancedTableProps) {
	const { onSelectAllClick } = props;

	return (
		<TableHead>
			<TableRow>
				{headCells.map((headCell) => (
					<TableCell
						key={headCell.id}
						align={headCell.numeric ? 'left' : 'center'}
						padding={headCell.disablePadding ? 'none' : 'normal'}
					>
						{headCell.label}
					</TableCell>
				))}
			</TableRow>
		</TableHead>
	);
}

interface InquiryPanelListType {
	dense?: boolean;
	inquiryData?: any;
	searchInquiries?: any;
}

export const InquiryList = (props: InquiryPanelListType) => {
	const { dense, searchInquiries } = props;
	const router = useRouter();
	const [inquiryList, setInquiryList] = useState<any[]>([]);

	/** APOLLO REQUESTS **/
	const {
		loading: getInquiriesLoading,
		data: getInquiriesData,
		error: getInquiriesError,
		refetch: getInquiriesRefetch,
	} = useQuery(GET_ALL_CS, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: {
				page: 1,
				limit: 10,
				sort: 'createdAt',
				direction: 'DESC',
				search: {
					csType: CsType.INQUIRY,
					...searchInquiries,
				},
			},
		},
		notifyOnNetworkStatusChange: true,
		pollInterval: 30000, // Refetch every 30 seconds to show updated statuses
		onCompleted: (data) => {
			setInquiryList(data?.getAllCs?.list || []);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (searchInquiries) {
			getInquiriesRefetch({
				input: {
					page: 1,
					limit: 10,
					sort: 'createdAt',
					direction: 'DESC',
					search: {
						csType: CsType.INQUIRY,
						...searchInquiries,
					},
				},
			});
		}
	}, [searchInquiries]);

	/** HANDLERS **/
	const handleViewClick = (inquiryId: string) => {
		router.push(`/_admin/cs/inquiry_detail?id=${inquiryId}`);
	};

	const getStatusColor = (status: string): 'warning' | 'success' | 'default' => {
		switch (status) {
			case 'PENDING':
				return 'warning';
			case 'ANSWERED':
				return 'success';
			case 'CLOSED':
				return 'default';
			default:
				return 'default';
		}
	};

	return (
		<Stack>
			<TableContainer>
				<Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size={dense ? 'small' : 'medium'}>
					{/*@ts-ignore*/}
					<EnhancedTableHead />
					<TableBody>
						{inquiryList?.map((inquiry: any, index: number) => {
							const member_image = inquiry?.memberData?.memberImage || '/img/profile/defaultUser.svg';

							return (
								<TableRow hover key={inquiry._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
									<TableCell align="left">{inquiry.csCategory}</TableCell>
									<TableCell align="left">
										<Link href={`/_admin/cs/inquiry_detail?id=${inquiry._id}`}>
											<div className={'title-cell'}>{inquiry.csTitle}</div>
										</Link>
									</TableCell>
									<TableCell align="left" className={'name'}>
										<Stack direction={'row'} alignItems={'center'}>
											<Avatar alt={inquiry?.memberData?.memberNick} src={member_image} sx={{ ml: '2px', mr: '10px' }} />
											<div>{inquiry?.memberData?.memberNick || 'Unknown'}</div>
										</Stack>
									</TableCell>
									<TableCell align="left">
										{inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleDateString() : '-'}
									</TableCell>
									<TableCell align="center">
										<Chip
											label={inquiry.inquiryStatus || 'PENDING'}
											color={getStatusColor(inquiry.inquiryStatus)}
											sx={{ fontWeight: 600, minWidth: 90 }}
										/>
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
