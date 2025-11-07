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
} from '@mui/material';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_CS } from '../../../apollo/user/mutation';
import { UPDATE_CS_BY_ADMIN } from '../../../apollo/admin/mutation';
import { GET_CS } from '../../../apollo/user/query';
import { CsType, CsCategory } from '../../../libs/enums/cs.enum';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../../libs/sweetAlert';

const FaqCreate: NextPage = () => {
	const router = useRouter();
	const { id } = router.query as { id?: string };
	const isEdit = !!id;

	const [category, setCategory] = useState<CsCategory>(CsCategory.OTHER);
	const [title, setTitle] = useState('');
	const [content, setContent] = useState('');

	/** APOLLO REQUESTS **/
	const { data: faqData, loading: faqLoading } = useQuery(GET_CS, {
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
						},
					},
				});
				await sweetTopSmallSuccessAlert('FAQ updated successfully!', 1500);
			} else {
				await createCs({
					variables: {
						input: {
							csType: CsType.FAQ,
							csCategory: category,
							csTitle: title,
							csContent: content,
						},
					},
				});
				await sweetTopSmallSuccessAlert('FAQ created successfully!', 1500);
			}

			router.push('/_admin/cs/faq');
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const handleCancel = () => {
		router.push('/_admin/cs/faq');
	};

	return (
		<Box component={'div'} className={'content'}>
			<Box component={'div'} className={'title flex_space'}>
				<Typography variant={'h2'}>{isEdit ? 'Edit FAQ' : 'Create New FAQ'}</Typography>
			</Box>

			<Box component={'div'} className={'form-wrap'} sx={{ mt: 4 }}>
				{faqLoading ? (
					<Alert severity="info">Loading FAQ data...</Alert>
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
								label="Question *"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder={!title ? 'Enter the FAQ question' : ''}
								InputLabelProps={{ shrink: true }}
							/>

							<TextField
								fullWidth
								required
								multiline
								rows={8}
								label="Answer *"
								value={content}
								onChange={(e) => setContent(e.target.value)}
								placeholder={!content ? 'Enter the FAQ answer' : ''}
								InputLabelProps={{ shrink: true }}
							/>

							<Stack direction="row" spacing={2}>
								<Button
									type="submit"
									variant="contained"
									size="large"
									disabled={createLoading || updateLoading}
									sx={{ minWidth: 150 }}
								>
									{createLoading || updateLoading ? 'Saving...' : isEdit ? 'Update FAQ' : 'Create FAQ'}
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

export default withAdminLayout(FaqCreate);
