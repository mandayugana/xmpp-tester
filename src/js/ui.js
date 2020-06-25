$(document).ready(function () {
    $('#password-toggle').bind('click', function(e)
    {
        password = $('#password');
        c = $(this).find('small');
        if (password.attr('type') == 'password') {
            password.attr('type', 'text');
            c.text('Hide');
        } else {
            password.attr('type', 'password');
            c.text('Show');
        }
    });
});