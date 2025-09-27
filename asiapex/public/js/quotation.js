frappe.ui.form.on('Quotation', {
    refresh: function(frm) {
        // Hide the top-right printer icon after it's rendered
        setTimeout(() => {
            frm.page.wrapper.find('button[data-original-title="Print"]').hide();
            frm.page.wrapper.find('button[title="Print"]').hide(); // just in case
        }, 100);

        // Add custom direct Print button
        if (!frm.is_new() && frm.doc.status !== 'Cancelled') {
            frm.add_custom_button(__('Print'), function() {
                const url = `/api/method/asiapex.py.quotation.print?name=${frm.doc.name}`;
                window.open(url);
            });
        }
    }
});
