import { useState } from 'react';
import { AccountsPayableList } from '@/pages/finance/AccountsPayableList';
import { AccountsReceivableList } from '@/pages/finance/AccountsReceivableList';

type TabValue = 'accounts_payable' | 'accounts_receivable';

export default function FinanceiroPage() {
  const [activeTab, setActiveTab] = useState<TabValue>('accounts_payable');

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('accounts_payable')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'accounts_payable'
              ? 'border-b-2 border-blue-600 text-blue-700'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Contas a pagar
        </button>
        <button
          onClick={() => setActiveTab('accounts_receivable')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'accounts_receivable'
              ? 'border-b-2 border-blue-600 text-blue-700'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Contas a receber
        </button>
      </div>

      {activeTab === 'accounts_payable' && <AccountsPayableList />}
      {activeTab === 'accounts_receivable' && <AccountsReceivableList />}
    </div>
  );
}
