import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import {
	Box,
	Button,
	Stack,
	TextField,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	Typography,
	Alert,
	Checkbox,
	FormControlLabel,
} from '@mui/material';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_CS } from '../../../apollo/user/mutation';
import { UPDATE_CS_BY_ADMIN } from '../../../apollo/admin/mutation';
import { GET_CS } from '../../../apollo/user/query';
import { CsType, CsCategory } from '../../../libs/enums/cs.enum';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../../libs/sweetAlert';

const NoticeCreate: NextPage = () => {
	const router = useRouter();
	const { id } = router.query as { id?: string };
	const isEdit = !!id;

	const [category, setCategory] = useState<CsCategory>(CsCategory.OTHER);
	const [title, setTitle] = useState('');
	const [content, setContent] = useState('');
	const [isEvent, setIsEvent] = useState(false);

	/** APOLLO REQUESTS **/
	const { data: noticeData, loading: noticeLoading } = useQuery(GET_CS, {
		skip: !isEdit || !id,
		fetchPolicy: 'network-only',
		variables: {
			csId: id,
		},
		onCompleted: (data) => {
			if (data?.getCs) {
				setCategory(data.getCs.csCategory);
				setTitle(data.getCs.csTitle);
				setContent(data.getCs.csContent);
				setIsEvent(data.getCs.csEvent || false);
			}
		},
	});

	const [createCs, { loading: createLoading }] = useMutation(CREATE_CS);
	const [updateCsByAdmin, { loading: updateLoading }] = useMutation(UPDATE_CS_BY_ADMIN);

	/** LIFECYCLES **/
	/** HANDLERS **/
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!title.trim() || !content.trim()) {
			await sweetErrorHandling('Please fill in all required fields');
			return;
		}

		try {
			if (isEdit) {
				await updateCsByAdmin({
					variables: {
						input: {
							_id: id,
							csCategory: category,
							csTitle: title,
							csContent: content,
							csEvent: isEvent,
						},
					},
				});
				await sweetTopSmallSuccessAlert('Notice updated successfully!', 1500);
			} else {
				await createCs({
					variables: {
						input: {
							csType: CsType.NOTICE,
							csCategory: category,
							csTitle: title,
							csContent: content,
							csEvent: isEvent,
						},
					},
				});
				await sweetTopSmallSuccessAlert('Notice created successfully!', 1500);
			}

			router.push('/_admin/cs/notice');
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const handleCancel = () => {
		router.push('/_admin/cs/notice');
	};

	return (
		<Box component={'div'} className={'content'}>
			<Box component={'div'} className={'title flex_space'}>
				<Typography variant={'h2'}>{isEdit ? 'Edit Notice' : 'Create New Notice'}</Typography>
			</Box>

			<Box component={'div'} className={'form-wrap'} sx={{ mt: 4 }}>
				{noticeLoading ? (
					<Alert severity="info">Loading notice data...</Alert>
				) : (
					<Box component="form" onSubmit={handleSubmit}>
						<Stack spacing={4} sx={{ maxWidth: 800 }}>
							<FormControl fullWidth required>
								<InputLabel shrink sx={{ bgcolor: 'white', px: 1 }}>
									Category *
								</InputLabel>
								<Select
									value={category}
									onChange={(e) => setCategory(e.target.value as CsCategory)}
									displayEmpty
									notched
									label="Category *"
								>
									<MenuItem value={CsCategory.PROPERTY}>Property</MenuItem>
									<MenuItem value={CsCategory.PAYMENT}>Payment</MenuItem>
									<MenuItem value={CsCategory.BUYERS}>Buyers</MenuItem>
									<MenuItem value={CsCategory.AGENTS}>Agents</MenuItem>
									<MenuItem value={CsCategory.MEMBERSHIP}>Membership</MenuItem>
									<MenuItem value={CsCategory.COMMUNITY}>Community</MenuItem>
									<MenuItem value={CsCategory.OTHER}>Other</MenuItem>
								</Select>
							</FormControl>

							<TextField
								fullWidth
								required
								label="Title *"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder={!title ? 'Enter the notice title' : ''}
								InputLabelProps={{ shrink: true }}
							/>

							<TextField
								fullWidth
								required
								multiline
								rows={10}
								label="Content *"
								value={content}
								onChange={(e) => setContent(e.target.value)}
								placeholder={!content ? 'Enter the notice content' : ''}
								InputLabelProps={{ shrink: true }}
							/>

							<FormControlLabel
								control={<Checkbox checked={isEvent} onChange={(e) => setIsEvent(e.target.checked)} />}
								label="Mark as Event Notice"
							/>

							<Stack direction="row" spacing={2}>
								<Button
									type="submit"
									variant="contained"
									size="large"
									disabled={createLoading || updateLoading}
									sx={{ minWidth: 150 }}
								>
									{createLoading || updateLoading ? 'Saving...' : isEdit ? 'Update Notice' : 'Create Notice'}
								</Button>
								<Button variant="outlined" size="large" onClick={handleCancel} sx={{ minWidth: 150 }}>
									Cancel
								</Button>
							</Stack>
						</Stack>
					</Box>
				)}
			</Box>
		</Box>
	);
};

export default withAdminLayout(NoticeCreate);
