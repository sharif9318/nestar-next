import { CsCategory, CsStatus, CsType, InquiryStatus } from '../../enums/cs.enum';
import { Member } from '../member/member';

export interface Cs {
	_id: string;
	csStatus: CsStatus;
	csType: CsType;
	csCategory: CsCategory;
	csTitle: string;
	csContent: string;
	csEvent?: boolean;
	inquiryStatus?: InquiryStatus;
	memberId: string;
	csAnswer?: string;
	answeredAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	memberData?: Member;
}

export interface CsList {
	list: Cs[];
	metaCounter: MetaCounter[];
}

interface MetaCounter {
	total: number;
}
