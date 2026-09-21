/**
 * CSV Parsing and Mapping Utility for FollowUp CRM
 * RFC 4180 compliant with header autodiscovery for Indian merchants
 */

export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote
          currentCell += '"';
          i++;
        } else {
          // End of quote
          inQuotes = false;
        }
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if (char === '\r') {
        if (nextChar === '\n') {
          i++;
        }
        currentRow.push(currentCell.trim());
        if (currentRow.some((c) => c.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
      } else if (char === '\n') {
        currentRow.push(currentCell.trim());
        if (currentRow.some((c) => c.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
  }

  // Last cell/row if any
  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((c) => c.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

export interface ParsedCustomerRow {
  name: string;
  phone: string;
  notes?: string;
  tags?: string[];
  pendingBalance?: number;
}

export function mapCSVToCustomerRows(rows: string[][]): {
  records: ParsedCustomerRow[];
  headers: string[];
} {
  if (rows.length === 0) return { records: [], headers: [] };

  const rawHeaders = rows[0].map((h) => h.toLowerCase().trim());

  // Find column indices
  const nameIdx = rawHeaders.findIndex((h) =>
    ['name', 'customer', 'customer name', 'full name', 'client'].includes(h)
  );
  const phoneIdx = rawHeaders.findIndex((h) =>
    ['phone', 'mobile', 'contact', 'whatsapp', 'number', 'cell', 'phone number'].includes(h)
  );
  const notesIdx = rawHeaders.findIndex((h) =>
    ['notes', 'note', 'remark', 'remarks', 'comment', 'comments', 'history'].includes(h)
  );
  const tagsIdx = rawHeaders.findIndex((h) =>
    ['tags', 'tag', 'category', 'type', 'group'].includes(h)
  );
  const balanceIdx = rawHeaders.findIndex((h) =>
    ['balance', 'pending balance', 'pending', 'due', 'khata', 'udhar', 'dues'].includes(h)
  );

  const dataRows = rows.slice(1);
  const records: ParsedCustomerRow[] = [];

  for (const row of dataRows) {
    if (!row.some((cell) => cell.trim().length > 0)) continue;

    const name = nameIdx !== -1 ? (row[nameIdx] || '').trim() : (row[0] || '').trim();
    const phone = phoneIdx !== -1 ? (row[phoneIdx] || '').trim() : (row[1] || '').trim();
    const notes = notesIdx !== -1 ? (row[notesIdx] || '').trim() : undefined;
    const tagsRaw = tagsIdx !== -1 ? (row[tagsIdx] || '').trim() : undefined;
    const balanceRaw = balanceIdx !== -1 ? parseFloat(row[balanceIdx] || '0') : 0;

    const tags = tagsRaw
      ? tagsRaw.split(/[,;|]/).map((t) => t.trim()).filter(Boolean)
      : ['Imported'];

    records.push({
      name,
      phone,
      notes: notes || undefined,
      tags: tags.length > 0 ? tags : ['Imported'],
      pendingBalance: isNaN(balanceRaw) ? 0 : balanceRaw,
    });
  }

  return { records, headers: rows[0] };
}
