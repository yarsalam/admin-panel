import { Injectable } from '@nestjs/common';
import { UserApiClientService } from 'src/admin/common/api-client/user-api-client.service';

export interface RawSnapshot {
  totalActiveUsers: number;
  dauCount: number;
  dauYesterdayCount: number;
  mauCount: number;
  mauPrevCount: number;
  newToday: number;
  newThisWeek: number;
  genderCounts: { gender: string; cnt: string }[];
  activeGenderCounts: { gender: string; cnt: string }[];
  verifiedFemaleCount: number;
  cohort7dBase: number;
  cohort7dReturned: number;
  cohort30dBase: number;
  cohort30dReturned: number;
  femaleRetention7dBase: number;
  femaleRetention7dReturned: number;
  femaleRetention30dBase: number;
  femaleRetention30dReturned: number;
  premiumRetention30dBase: number;
  premiumRetention30dReturned: number;
  freeRetention30dBase: number;
  freeRetention30dReturned: number;
  activeFemale7d: number;
  activeFemalePrev7d: number;
  activeMale7d: number;
  activeMalePrev7d: number;
  phaseCounts: { phase: string; cnt: string }[];
  tierCounts: { tier: string; cnt: string }[];
  likesLast30d: number;
  matchesLast30d: number;
  mutualLikesLast30d: number;
  femaleMatchReceivers: number;
  activeFemaleBase: number;
  conversationPairCount: number;
  singleMessagePairCount: number;
  replyStats: { total: string; readCount: string };
  avgMsgPerPair: { pair: string; msgCount: string }[];
  signups30d: number;
  completedProfiles30d: number;
  withPhotos30d: string;
  firstLikers30d: string;
  firstMatchReceivers30d: string;
  firstChatters30d: string;
  revenueThisMonth: string;
  revenueLastMonth: string;
  revenue7d: string;
  revenuePrev7d: string;
  premiumUserCount: number;
  payingUserCount: number;
  reportsToday: number;
  pendingModeration: number;
  blockedToday: number;
  fakeProfileCount: number;
  verifiedAllCount: number;
  highRiskCount: number;
  totalSessions7d?: number;
  peakHour: string;
  newFemaleThisWeek: number;
  avgReplyMinutes: string;
  retentionD7: number;
  femaleRetentionD7: number;
  femaleRetentionD30: number;
  unansweredLikesCount: number;
  ghostedPairCount: number;
  maleRetention7dBase: number;
  maleRetention7dReturned: number;
  maleRetention30dBase: number;
  maleRetention30dReturned: number;
  meaningfulConversations30d: number;
}

@Injectable()
export class RawDataCollector {
  private readonly SNAPSHOT_PATH = '/admin-api/intelligence/raw-snapshot';

  constructor(private readonly userApi: UserApiClientService) {}

  async collect(): Promise<RawSnapshot> {
    const raw = await this.userApi.get<Partial<RawSnapshot>>(
      this.SNAPSHOT_PATH,
    );

    return {
      totalActiveUsers: 0,
      dauCount: 0,
      dauYesterdayCount: 0,
      mauCount: 0,
      mauPrevCount: 0,
      newToday: 0,
      newThisWeek: 0,
      genderCounts: [],
      activeGenderCounts: [],
      verifiedFemaleCount: 0,
      cohort7dBase: 0,
      cohort7dReturned: 0,
      cohort30dBase: 0,
      cohort30dReturned: 0,
      femaleRetention7dBase: 0,
      femaleRetention7dReturned: 0,
      femaleRetention30dBase: 0,
      femaleRetention30dReturned: 0,
      premiumRetention30dBase: 0,
      premiumRetention30dReturned: 0,
      freeRetention30dBase: 0,
      freeRetention30dReturned: 0,
      activeFemale7d: 0,
      activeFemalePrev7d: 0,
      activeMale7d: 0,
      activeMalePrev7d: 0,
      phaseCounts: [],
      tierCounts: [],
      likesLast30d: 0,
      matchesLast30d: 0,
      mutualLikesLast30d: 0,
      femaleMatchReceivers: 0,
      activeFemaleBase: 0,
      conversationPairCount: 0,
      singleMessagePairCount: 0,
      replyStats: { total: '0', readCount: '0' },
      avgMsgPerPair: [],
      signups30d: 0,
      completedProfiles30d: 0,
      withPhotos30d: '0',
      firstLikers30d: '0',
      firstMatchReceivers30d: '0',
      firstChatters30d: '0',
      revenueThisMonth: '0',
      revenueLastMonth: '0',
      revenue7d: '0',
      revenuePrev7d: '0',
      premiumUserCount: 0,
      payingUserCount: 0,
      reportsToday: 0,
      pendingModeration: 0,
      blockedToday: 0,
      fakeProfileCount: 0,
      verifiedAllCount: 0,
      highRiskCount: 0,
      peakHour: '21',
      newFemaleThisWeek: 0,
      avgReplyMinutes: '0',
      retentionD7: 0,
      femaleRetentionD7: 0,
      femaleRetentionD30: 0,
      unansweredLikesCount: 0,
      ghostedPairCount: 0,
      maleRetention7dBase: 0,
      maleRetention7dReturned: 0,
      maleRetention30dBase: 0,
      maleRetention30dReturned: 0,
      meaningfulConversations30d: 0,
      ...raw,
    };
  }
}
