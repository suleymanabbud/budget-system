import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'

export interface Permission {
  view_own_company: boolean
  edit_own_budget: boolean
  view_own_reports: boolean
  view_all_companies: boolean
  edit_all_budgets: boolean
  manage_users: boolean
  manage_companies: boolean
  view_admin_dashboard: boolean
}

export const usePermissions = (): Permission => {
  const { user } = useSelector((state: RootState) => state.auth)
  
  if (!user) {
    return {
      view_own_company: false,
      edit_own_budget: false,
      view_own_reports: false,
      view_all_companies: false,
      edit_all_budgets: false,
      manage_users: false,
      manage_companies: false,
      view_admin_dashboard: false,
    }
  }

  const isAdmin = user.role === 'admin' || user.role === 'ADMIN'
  const isCompanyAdmin = user.role === 'company_admin' || user.role === 'COMPANY_ADMIN'
  const isCompanyUser = user.role === 'company_user' || user.role === 'COMPANY_USER'
  const isViewer = user.role === 'viewer' || user.role === 'VIEWER'

  return {
    // Company-specific permissions
    view_own_company: isCompanyAdmin || isCompanyUser || isViewer,
    edit_own_budget: isCompanyAdmin || isCompanyUser,
    view_own_reports: isCompanyAdmin || isCompanyUser || isViewer,
    
    // Admin permissions
    view_all_companies: isAdmin,
    edit_all_budgets: isAdmin,
    manage_users: isAdmin || isCompanyAdmin,
    manage_companies: isAdmin,
    view_admin_dashboard: isAdmin,
  }
}

export const useCanAccessCompany = (companyId: number): boolean => {
  const { user } = useSelector((state: RootState) => state.auth)
  
  if (!user) return false
  
  // Admin can access all companies
  if (user.role === 'admin' || user.role === 'ADMIN') return true
  
  // Company users can only access their own company
  return user.company_id === companyId
}

export const useIsAdmin = (): boolean => {
  const { user } = useSelector((state: RootState) => state.auth)
  return user?.role === 'admin' || user?.role === 'ADMIN' || false
}

export const useIsCompanyAdmin = (): boolean => {
  const { user } = useSelector((state: RootState) => state.auth)
  return user?.role === 'company_admin' || user?.role === 'COMPANY_ADMIN' || false
}

export const useIsCompanyUser = (): boolean => {
  const { user } = useSelector((state: RootState) => state.auth)
  return user?.role === 'company_user' || user?.role === 'COMPANY_USER' || false
}
