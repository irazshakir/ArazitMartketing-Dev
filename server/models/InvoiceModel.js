import supabase from '../config/database.js';

const InvoiceModel = {
  create: async (invoiceData) => {
    try {
      let status = 'Pending';
      if (invoiceData.amount_received > 0) {
        status = invoiceData.remaining_amount === 0 ? 'Paid' : 'Partially Paid';
      }

      const invoicePayload = {
        invoice_number: invoiceData.invoiceNumber,
        created_date: invoiceData.created_date,
        due_date: invoiceData.due_date,
        bill_to: invoiceData.bill_to,
        notes: invoiceData.notes || null,
        total_amount: invoiceData.total_amount,
        amount_received: invoiceData.amount_received,
        remaining_amount: invoiceData.remaining_amount,
        status: status
      };

      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([invoicePayload])
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      if (invoiceData.items && invoiceData.items.length > 0) {
        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(
            invoiceData.items.map(item => ({
              invoice_id: invoice.id,
              service_name: item.service_name,
              description: item.description,
              amount: item.amount
            }))
          );

        if (itemsError) throw itemsError;
      }

      if (invoiceData.amount_received > 0) {
        const { error: paymentError } = await supabase
          .from('payment_history')
          .insert([{
            invoice_id: invoice.id,
            amount: invoiceData.amount_received,
            payment_type: 'Online',
            payment_date: invoiceData.created_date,
            remaining_amount: invoiceData.remaining_amount,
            payment_notes: invoiceData.notes
          }]);

        if (paymentError) throw paymentError;
      }

      return invoice;
    } catch (error) {
      throw error;
    }
  },

  findAll: async ({ search } = {}) => {
    try {
      let query = supabase
        .from('invoices')
        .select(`
          *,
          invoice_items (*)
        `);

      if (search) {
        query = query.or(`
          invoice_number.ilike.%${search}%,
          bill_to.ilike.%${search}%
        `);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  findOne: async (id) => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          invoice_items (*),
          payment_history (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  update: async (id, invoiceData) => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .update(invoiceData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  addPayment: async (invoiceId, paymentData) => {
    try {
      // Get current invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('total_amount, amount_received')
        .eq('id', invoiceId)
        .single();

      if (invoiceError) throw invoiceError;

      const newAmountReceived = invoice.amount_received + Number(paymentData.amount);
      const remainingAmount = invoice.total_amount - newAmountReceived;
      const status = remainingAmount === 0 ? 'PAID' : 'PARTIALLY_PAID';

      // Create payment record
      const { data: payment, error: paymentError } = await supabase
        .from('payment_history')
        .insert([{
          invoice_id: invoiceId,
          amount: paymentData.amount,
          payment_type: paymentData.paymentType,
          payment_date: paymentData.paymentDate,
          remaining_amount: remainingAmount,
          payment_notes: paymentData.notes
        }])
        .select();

      if (paymentError) throw paymentError;

      // Update invoice
      const { error: updateError } = await supabase
        .from('invoices')
        .update({
          amount_received: newAmountReceived,
          remaining_amount: remainingAmount,
          status: status
        })
        .eq('id', invoiceId);

      if (updateError) throw updateError;

      return payment;
    } catch (error) {
      throw error;
    }
  }
};

export default InvoiceModel; 