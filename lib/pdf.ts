import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { Invoice, BusinessProfile } from './types';
import { formatCurrency, formatDate } from './utils';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function generateInvoiceHtml(
  invoice: Invoice,
  business: BusinessProfile,
): string {
  const currency = business.currency || 'USD';

  const itemRows = invoice.items
    .map(
      (item) => `
    <tr>
      <td style="padding:10px 8px;border-bottom:1px solid #eee;">${escapeHtml(item.description)}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right;">${formatCurrency(item.price, currency)}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right;">${formatCurrency(item.total, currency)}</td>
    </tr>
  `,
    )
    .join('');

  const paymentRows =
    invoice.payments.length > 0
      ? invoice.payments
          .map(
            (p) => `
      <tr>
        <td style="padding:6px 0;color:#666;">${formatDate(p.date)} - ${escapeHtml(p.method)}</td>
        <td style="padding:6px 0;text-align:right;color:#2ECC71;">-${formatCurrency(p.amount, currency)}</td>
      </tr>
    `,
          )
          .join('')
      : '';

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; margin: 0; padding: 40px; }
  .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
  .company { max-width: 60%; }
  .company h1 { margin: 0; font-size: 24px; color: #0D7377; }
  .company p { margin: 4px 0; color: #666; font-size: 13px; }
  .invoice-info { text-align: right; }
  .invoice-info h2 { margin: 0; font-size: 28px; color: #0D7377; text-transform: uppercase; letter-spacing: 2px; }
  .invoice-info p { margin: 4px 0; color: #666; font-size: 13px; }
  .bill-to { margin-bottom: 30px; }
  .bill-to h3 { color: #999; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
  .bill-to p { margin: 2px 0; font-size: 14px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
  th { background: #0D7377; color: white; padding: 12px 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
  th:first-child { text-align: left; border-radius: 6px 0 0 0; }
  th:last-child { text-align: right; border-radius: 0 6px 0 0; }
  th:nth-child(2) { text-align: center; }
  th:nth-child(3) { text-align: right; }
  .totals { margin-left: auto; width: 280px; }
  .totals table { margin-bottom: 0; }
  .totals td { padding: 8px 0; font-size: 14px; }
  .totals tr:last-child td { font-weight: bold; font-size: 18px; color: #0D7377; border-top: 2px solid #0D7377; padding-top: 12px; }
  .notes { margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 8px; }
  .notes h3 { margin: 0 0 8px; font-size: 13px; color: #999; text-transform: uppercase; }
  .notes p { margin: 0; font-size: 13px; color: #666; }
  .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
  .status-paid { background: #E8F8F0; color: #2ECC71; }
  .status-sent { background: #EFF6FF; color: #3B82F6; }
  .status-overdue { background: #FDECEB; color: #E74C3C; }
  .status-draft { background: #F3F4F6; color: #9CA3AF; }
  .status-partial { background: #FEF5E7; color: #F39C12; }
</style>
</head>
<body>
  <div class="header">
    <div class="company">
      <h1>${escapeHtml(business.name || 'Your Business')}</h1>
      ${business.address ? `<p>${escapeHtml(business.address)}</p>` : ''}
      ${business.city ? `<p>${escapeHtml(business.city)}${business.state ? ', ' + escapeHtml(business.state) : ''} ${escapeHtml(business.zip)}</p>` : ''}
      ${business.email ? `<p>${escapeHtml(business.email)}</p>` : ''}
      ${business.phone ? `<p>${escapeHtml(business.phone)}</p>` : ''}
      ${business.taxId ? `<p>Tax ID: ${escapeHtml(business.taxId)}</p>` : ''}
    </div>
    <div class="invoice-info">
      <h2>Invoice</h2>
      <p><strong>${escapeHtml(invoice.invoiceNumber)}</strong></p>
      <p>Issue Date: ${formatDate(invoice.issueDate)}</p>
      <p>Due Date: ${formatDate(invoice.dueDate)}</p>
      <p><span class="status-badge status-${invoice.status}">${invoice.status}</span></p>
    </div>
  </div>
  <div class="bill-to">
    <h3>Bill To</h3>
    <p><strong>${escapeHtml(invoice.clientName)}</strong></p>
  </div>
  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Qty</th>
        <th>Price</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
  </table>
  <div class="totals">
    <table>
      <tr>
        <td>Subtotal</td>
        <td style="text-align:right">${formatCurrency(invoice.subtotal, currency)}</td>
      </tr>
      ${invoice.discount > 0 ? `<tr><td>Discount</td><td style="text-align:right;color:#E74C3C;">-${formatCurrency(invoice.discount, currency)}</td></tr>` : ''}
      ${invoice.taxRate > 0 ? `<tr><td>Tax (${invoice.taxRate}%)</td><td style="text-align:right">${formatCurrency(invoice.taxAmount, currency)}</td></tr>` : ''}
      ${paymentRows ? `<tr><td colspan="2" style="padding-top:12px;font-weight:600;font-size:13px;color:#999;">Payments</td></tr>${paymentRows}` : ''}
      <tr>
        <td>Amount Due</td>
        <td style="text-align:right">${formatCurrency(invoice.amountDue, currency)}</td>
      </tr>
    </table>
  </div>
  ${invoice.notes ? `<div class="notes"><h3>Notes</h3><p>${escapeHtml(invoice.notes)}</p></div>` : ''}
</body>
</html>`;
}

export async function printInvoice(
  invoice: Invoice,
  business: BusinessProfile,
): Promise<void> {
  const html = generateInvoiceHtml(invoice, business);
  await Print.printAsync({ html });
}

export async function shareInvoice(
  invoice: Invoice,
  business: BusinessProfile,
): Promise<void> {
  const html = generateInvoiceHtml(invoice, business);
  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri, {
    UTI: '.pdf',
    mimeType: 'application/pdf',
  });
}
