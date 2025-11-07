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
} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { Stack } from '@mui/material';
import { useMutation, useQuery } from '@apollo/client';
import { GET_ALL_CS } from '../../../../apollo/admin/query';
import { REMOVE_CS_BY_ADMIN } from '../../../../apollo/admin/mutation';
import { CsType } from '../../../enums/cs.enum';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../../sweetAlert';

interface Data {
	category: string;
	title: string;
	writer: string;
	date: string;
	action: string;
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

interface FaqArticlesPanelListType {
	dense?: boolean;
	faqData?: any;
	searchFaqs?: any;
}

export const FaqArticlesPanelList = (props: FaqArticlesPanelListType) => {
	const { dense, searchFaqs } = props;
	const router = useRouter();
	const [faqList, setFaqList] = useState<any[]>([]);

	/** APOLLO REQUESTS **/
	const {
		loading: getFaqsLoading,
		data: getFaqsData,
		error: getFaqsError,
		refetch: getFaqsRefetch,
	} = useQuery(GET_ALL_CS, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				page: 1,
				limit: 10,
				sort: 'createdAt',
				direction: 'DESC',
				search: {
					csType: CsType.FAQ,
					...searchFaqs,
				},
			},
		},
		notifyOnNetworkStatusChange: true,
		onCompleted: (data) => {
			setFaqList(data?.getAllCs?.list || []);
		},
	});

	const [removeCsByAdmin] = useMutation(REMOVE_CS_BY_ADMIN);

	/** LIFECYCLES **/
	useEffect(() => {
		if (searchFaqs) {
			getFaqsRefetch({
				input: {
					page: 1,
					limit: 10,
					sort: 'createdAt',
					direction: 'DESC',
					search: {
						csType: CsType.FAQ,
						...searchFaqs,
					},
				},
			});
		}
	}, [searchFaqs]);

	/** HANDLERS **/
	const handleEditClick = (faqId: string) => {
		router.push(`/_admin/cs/faq_create?id=${faqId}`);
	};

	const handleDeleteClick = async (faqId: string) => {
		try {
			if (confirm('Are you sure you want to delete this FAQ?')) {
				await removeCsByAdmin({
					variables: {
						csId: faqId,
					},
				});
				await sweetTopSmallSuccessAlert('FAQ deleted successfully!', 800);
				getFaqsRefetch();
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
					<EnhancedTableHead />
					<TableBody>
						{faqList?.map((faq: any, index: number) => {
							const member_image = faq?.memberData?.memberImage || '/img/profile/defaultUser.svg';

							return (
								<TableRow hover key={faq._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
									<TableCell align="left">{faq.csCategory}</TableCell>
									<TableCell align="left">
										<Link href={`/_admin/cs/faq_create?id=${faq._id}`}>
											<div className={'title-cell'}>{faq.csTitle}</div>
										</Link>
									</TableCell>
									<TableCell align="left" className={'name'}>
										<Stack direction={'row'} alignItems={'center'}>
											<Avatar alt={faq?.memberData?.memberNick} src={member_image} sx={{ ml: '2px', mr: '10px' }} />
											<div>{faq?.memberData?.memberNick || 'Unknown'}</div>
										</Stack>
									</TableCell>
									<TableCell align="left">
										{faq.createdAt ? new Date(faq.createdAt).toLocaleDateString() : '-'}
									</TableCell>
									<TableCell align="center">
										<Button onClick={() => handleEditClick(faq._id)} className={'badge primary'}>
											Edit
										</Button>
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
