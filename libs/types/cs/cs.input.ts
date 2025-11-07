import { CsCategory, CsType, InquiryStatus } from '../../enums/cs.enum';
import { Direction } from '../../enums/common.enum';

export interface CsInput {
	csType: CsType;
	csCategory?: CsCategory;
	csTitle: string;
	csContent: string;
	csEvent?: boolean;
}

export interface CsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: {
		csType?: CsType;
		csCategory?: CsCategory;
		inquiryStatus?: InquiryStatus;
		text?: string;
	};
}

export interface AllCsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search?: {
		csType?: CsType;
		csCategory?: CsCategory;
		inquiryStatus?: InquiryStatus;
		text?: string;
	};
}
