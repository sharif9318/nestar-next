import { CsCategory, InquiryStatus } from '../../enums/cs.enum';

export interface CsUpdate {
	_id: string;
	csCategory?: CsCategory;
	csTitle?: string;
	csContent?: string;
	csEvent?: boolean;
	csAnswer?: string;
	inquiryStatus?: InquiryStatus;
}
