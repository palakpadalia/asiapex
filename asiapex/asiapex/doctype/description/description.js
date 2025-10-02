// Copyright (c) 2025, Flitz Interactive and contributors
// For license information, please see license.txt

frappe.ui.form.on("Description", {
    description: function (frm) {
        // Strip HTML tags from Text Editor content
        let text = $('<div>').html(frm.doc.description || "").text();

        // Set the value in title_description
        frm.set_value("title_description", text);
    }
});
