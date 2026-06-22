export const RoleDefaultPermissions: Record<string, string[]> = {
  superadmin: [
    'manage_users',
    'edit_content',
    'delete_content',
    'view_analytics',
    'view_executive_panel',
    'view_safety_panel',
    'view_growth_panel',
    'view_product_panel',
    'manage_referral_campaigns',
  ],
  support: ['manage_users', 'view_analytics', 'view_safety_panel'],
  marketing: [
    'edit_content',
    'view_analytics',
    'view_growth_panel',
    'manage_referral_campaigns',
  ],
  product: ['edit_content', 'delete_content', 'view_product_panel'],
};
