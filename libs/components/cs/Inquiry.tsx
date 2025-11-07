import React, { useState } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import {
	Stack,
	Box,
	TextField,
	Select,
	MenuItem,
	Button,
	FormControl,
	InputLabel,
	Typography,
	Alert,
} from '@mui/material';
import { useMutation } from '@apollo/client';
import { CREATE_CS } from '../../../apollo/user/mutation';
import { CsType, CsCategory } from '../../enums/cs.enum';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../sweetAlert';

const Inquiry = () => {
	const device = useDeviceDetect();
	const [category, setCategory] = useState<CsCategory>(CsCategory.OTHER);
	const [title, setTitle] = useState('');
	const [content, setContent] = useState('');

	/** APOLLO REQUESTS **/
	const [createCs, { loading }] = useMutation(CREATE_CS);

	/** LIFECYCLES **/
	/** HANDLERS **/
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!title.trim() || !content.trim()) {
			await sweetErrorHandling('Please fill in all required fields');
			return;
		}

		try {
			await createCs({
				variables: {
					input: {
						csType: CsType.INQUIRY,
						csCategory: category,
						csTitle: title,
						csContent: content,
					},
				},
			});

			await sweetTopSmallSuccessAlert('Your inquiry has been submitted successfully!', 1500);

			// Reset form
			setTitle('');
			setContent('');
			setCategory(CsCategory.OTHER);
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	if (device === 'mobile') {
		return <div>Inquiry MOBILE</div>;
	} else {
		return (
			<Stack className={'inquiry-content'} spacing={3}>
				<Typography variant="h4" className={'title'}>
					Submit an Inquiry
				</Typography>

				<Alert severity="info">
					Have a question? Submit your inquiry and our team will respond as soon as possible.
				</Alert>

				<Box component="form" onSubmit={handleSubmit}>
					<Stack spacing={4}>
						<FormControl fullWidth>
							<InputLabel shrink sx={{ bgcolor: 'white', px: 1 }}>
								Category
							</InputLabel>
							<Select
								value={category}
								onChange={(e) => setCategory(e.target.value as CsCategory)}
								displayEmpty
								notched
								label="Category"
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
							label="Subject *"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder={!title ? 'Brief description of your inquiry' : ''}
							InputLabelProps={{ shrink: true }}
						/>

						<TextField
							fullWidth
							required
							multiline
							rows={6}
							label="Message *"
							value={content}
							onChange={(e) => setContent(e.target.value)}
							placeholder={!content ? 'Detailed description of your inquiry' : ''}
							InputLabelProps={{ shrink: true }}
						/>

						<Button type="submit" variant="contained" size="large" disabled={loading} fullWidth>
							{loading ? 'Submitting...' : 'Submit Inquiry'}
						</Button>
					</Stack>
				</Box>
			</Stack>
		);
	}
};

export default Inquiry;
