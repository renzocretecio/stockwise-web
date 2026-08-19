'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, TrendingDown, Eye, EyeOff, Plus } from 'lucide-react';
import { useState } from 'react';

export default function DashboardPage() {
  const [showBalance, setShowBalance] = useState(true);

  const portfolioData = {
    totalValue: 54250.75,
    dayGain: 1250.50,
    dayGainPercent: 2.35,
    weekGain: 2890.25,
    weekGainPercent: 5.63,
  };

  const watchlist = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 189.45, change: 2.35, changePercent: 1.26 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.80, change: -1.20, changePercent: -0.84 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 415.22, change: 5.75, changePercent: 1.40 },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.65, change: -3.45, changePercent: -1.37 },
  ];

  const recentTransactions = [
    { id: 1, type: 'buy', stock: 'AAPL', quantity: 10, price: 185.50, date: '2024-01-15', total: 1855.00 },
    { id: 2, type: 'sell', stock: 'MSFT', quantity: 5, price: 410.00, date: '2024-01-14', total: 2050.00 },
    { id: 3, type: 'buy', stock: 'GOOGL', quantity: 15, price: 140.25, date: '2024-01-13', total: 2103.75 },
    { id: 4, type: 'dividend', stock: 'AAPL', quantity: 20, price: 0.23, date: '2024-01-12', total: 4.60 },
  ];

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your portfolio overview.</p>
      </div>

      {/* Portfolio Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Portfolio Value */}
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Portfolio Value</p>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">
                {showBalance ? `$${portfolioData.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••••'}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBalance(!showBalance)}
                className="h-8 w-8 p-0"
              >
                {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </Card>

        {/* Daily Gain */}
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Today's Gain</p>
            <div className="flex items-center gap-2">
              <div>
                <div className="text-3xl font-bold text-green-600">
                  +${portfolioData.dayGain.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-sm text-green-600">+{portfolioData.dayGainPercent}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </Card>

        {/* Weekly Gain */}
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">7-Day Gain</p>
            <div className="flex items-center gap-2">
              <div>
                <div className="text-3xl font-bold text-green-600">
                  +${portfolioData.weekGain.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-sm text-green-600">+{portfolioData.weekGainPercent}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </Card>

        {/* Holdings */}
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Active Holdings</p>
            <div>
              <div className="text-3xl font-bold">12</div>
              <p className="text-sm text-muted-foreground">Across 5 sectors</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Watchlist */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Watchlist</h2>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Stock
              </Button>
            </div>
            <Separator className="mb-4" />
            <div className="space-y-3">
              {watchlist.map((stock) => (
                <div
                  key={stock.symbol}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent transition-colors"
                >
                  <div>
                    <p className="font-medium">{stock.symbol}</p>
                    <p className="text-sm text-muted-foreground">{stock.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${stock.price.toFixed(2)}</p>
                    <p className={`text-sm ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent}%)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
          <Separator className="mb-4" />
          <div className="space-y-2">
            <Button className="w-full" variant="default">
              Buy Stock
            </Button>
            <Button className="w-full" variant="outline">
              Sell Stock
            </Button>
            <Button className="w-full" variant="outline">
              View Portfolio
            </Button>
            <Button className="w-full" variant="outline">
              Deposit Funds
            </Button>
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
        </div>
        <Separator className="mb-4" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium text-muted-foreground">Type</th>
                <th className="text-left py-2 font-medium text-muted-foreground">Stock</th>
                <th className="text-right py-2 font-medium text-muted-foreground">Quantity</th>
                <th className="text-right py-2 font-medium text-muted-foreground">Price</th>
                <th className="text-right py-2 font-medium text-muted-foreground">Total</th>
                <th className="text-left py-2 font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((tx) => (
                <tr key={tx.id} className="border-b hover:bg-accent transition-colors">
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        tx.type === 'buy'
                          ? 'bg-blue-100 text-blue-800'
                          : tx.type === 'sell'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {tx.type === 'buy' ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : tx.type === 'sell' ? (
                        <TrendingDown className="h-3 w-3" />
                      ) : null}
                      {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 font-medium">{tx.stock}</td>
                  <td className="text-right py-3">{tx.quantity}</td>
                  <td className="text-right py-3">${tx.price.toFixed(2)}</td>
                  <td className="text-right py-3 font-medium">${tx.total.toFixed(2)}</td>
                  <td className="py-3 text-muted-foreground">{tx.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
