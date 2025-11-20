import api from './api'

export interface Account {
  id: number
  code: string
  name: string
  name_en?: string
  description?: string
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
  financial_statement?: string
  parent_id?: number
  level: number
  is_active: boolean
  is_leaf: boolean
  is_budgetable: boolean
  company_id?: number
  created_at: string
  updated_at: string
  children?: Account[]
  parent?: Account
}

export interface AccountCreate {
  code: string
  name: string
  name_en?: string
  description?: string
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
  financial_statement?: string
  parent_id?: number
  level?: number
  is_active?: boolean
  is_leaf?: boolean
  is_budgetable?: boolean
  company_id?: number
}

export interface AccountUpdate {
  code?: string
  name?: string
  name_en?: string
  description?: string
  account_type?: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
  parent_id?: number
  level?: number
  is_active?: boolean
  is_leaf?: boolean
  is_budgetable?: boolean
}

export interface AccountTree extends Account {
  children: AccountTree[]
}

export interface AccountStatistics {
  total_accounts: number
  leaf_accounts: number
  budgetable_accounts: number
  non_leaf_accounts: number
}

class AccountService {
  async getAccounts(account_type?: string, company_id?: number): Promise<Account[]> {
    const params = new URLSearchParams()
    if (account_type) params.append('account_type', account_type)
    if (company_id) params.append('company_id', company_id.toString())
    
    const response = await api.get(`/accounts?${params.toString()}`)
    return response.data
  }

  async getAccountsTree(company_id?: number): Promise<AccountTree[]> {
    const params = new URLSearchParams()
    if (company_id) params.append('company_id', company_id.toString())
    
    const response = await api.get(`/accounts/tree?${params.toString()}`)
    return response.data
  }

  async getBudgetableAccounts(company_id?: number): Promise<Account[]> {
    const params = new URLSearchParams()
    if (company_id) params.append('company_id', company_id.toString())
    
    const response = await api.get(`/accounts/budgetable?${params.toString()}`)
    return response.data
  }

  async getAccount(id: number): Promise<Account> {
    const response = await api.get(`/accounts/${id}`)
    return response.data
  }

  async createAccount(accountData: AccountCreate): Promise<Account> {
    const response = await api.post('/accounts/', accountData)
    return response.data
  }

  async updateAccount(id: number, accountData: AccountUpdate): Promise<Account> {
    const response = await api.put(`/accounts/${id}`, accountData)
    return response.data
  }

  async deleteAccount(id: number, force: boolean = false): Promise<{ message: string }> {
    const response = await api.delete(`/accounts/${id}?force=${force}`)
    return response.data
  }

  async getAccountHierarchy(id: number): Promise<Account[]> {
    const response = await api.get(`/accounts/${id}/hierarchy`)
    return response.data
  }

  async clearAllAccounts(): Promise<{ message: string; deleted_count: number }> {
    const response = await api.delete('/accounts/clear-all')
    return response.data
  }

  async clearLeafAccounts(): Promise<{ message: string; deleted_count: number }> {
    const response = await api.delete('/accounts/clear-leaf-accounts')
    return response.data
  }

  async updateLeafStatus(): Promise<{ message: string; updated_count: number }> {
    const response = await api.post('/accounts/update-leaf-status')
    return response.data
  }

  async searchAccounts(query: string, company_id?: number): Promise<Account[]> {
    const params = new URLSearchParams()
    params.append('q', query)
    if (company_id) params.append('company_id', company_id.toString())
    
    const response = await api.get(`/accounts/search?${params.toString()}`)
    return response.data
  }

  async getAccountStatistics(company_id?: number): Promise<AccountStatistics> {
    const params = new URLSearchParams()
    if (company_id) params.append('company_id', company_id.toString())
    
    const response = await api.get(`/accounts/statistics?${params.toString()}`)
    return response.data
  }

  // Helper methods
  getAccountTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      asset: 'أصول',
      liability: 'خصوم',
      equity: 'حقوق الملكية',
      revenue: 'إيرادات',
      expense: 'مصروفات'
    }
    return labels[type] || type
  }

  getAccountTypeColor(type: string): string {
    const colors: Record<string, string> = {
      asset: '#4CAF50',
      liability: '#F44336',
      equity: '#2196F3',
      revenue: '#FF9800',
      expense: '#9C27B0'
    }
    return colors[type] || '#757575'
  }

  buildAccountTree(accounts: Account[]): AccountTree[] {
    const accountMap = new Map<number, AccountTree>()
    const rootAccounts: AccountTree[] = []

    // Create map of all accounts
    accounts.forEach(account => {
      accountMap.set(account.id, { ...account, children: [] })
    })

    // Build tree structure
    accounts.forEach(account => {
      const accountNode = accountMap.get(account.id)!
      
      if (account.parent_id) {
        const parent = accountMap.get(account.parent_id)
        if (parent) {
          parent.children.push(accountNode)
        }
      } else {
        rootAccounts.push(accountNode)
      }
    })

    return rootAccounts
  }
}

export const accountService = new AccountService()
