var connection = null;

function formatXml(xml)
{
    // format XML
    var format = require('xml-formatter');
    formatted = format(xml, {
        'indentation': '  ',
        'collapseContent': true,
    });

    // highlight XML
    var highlighted = Prism.highlight(formatted, Prism.languages.xml, 'xml');

    // wrap
    return $('<pre>').append($('<code class="language-xml">').html(highlighted));
}

function formatLabel(label, badgeType = null)
{
    var formatted = $('<span class="badge">').append(label);
    // set badge type
    if (badgeType) {
        formatted.addClass('badge-' + badgeType);
    }
    return formatted;
}

function log(label, data)
{
    // decide badge type
    if (label == 'SENT') {
        var badgeType = 'secondary';
    } else if (label == 'RECV') {
        var badgeType = 'success';
    } else {
        var badgeType = 'dark';
    }

    var row = $('<div>').addClass('row mb-3');
    var labelCol = $('<div>').html(formatLabel(label, badgeType));

    if (data) {
        // use two columns
        var xmlCol = $('<div>').html(formatXml(data));
        row
            .append(labelCol.addClass('col-lg-2'))
            .append(xmlCol.addClass('col-lg-10'));
    } else {
        // use one column
        labelCol.addClass('col');
        row.append(labelCol);
    }

    $('#log').append(row);
}

function logInput(data)
{
    log('RECV', data);
}

function logOutput(data)
{
    log('SENT', data);
}

function connected()
{
    $('button#xmpp-connection').text('Disconnect');
    $('button#send-presence').prop('disabled', false);
    $('button#send-xml').prop('disabled', false);
}

function disconnected()
{
    $('button#xmpp-connection').text('Connect');
    $('button#send-presence').prop('disabled', true);
    $('button#send-xml').prop('disabled', true);
}

function onConnect(status)
{
    if (status == Strophe.Status.CONNECTING) {
        log('Connecting to XMPP server ...');
    } else if (status == Strophe.Status.CONNFAIL) {
        log('Failed connecting to XMPP server.');
        disconnected();
    } else if (status == Strophe.Status.DISCONNECTING) {
        log('Disconnecting XMPP server ...');
    } else if (status == Strophe.Status.DISCONNECTED) {
        log('Disconnected.');
        disconnected();
    } else if (status == Strophe.Status.CONNECTED) {
        log('Connected.');
        connected();
    }
}

$(document).ready(function () {
    var connection;

    $('button#xmpp-connection').bind('click', function (e)
    {
        e.preventDefault();
        if (connection == undefined || connection.authenticated == false) {
            // not connected
            var server = $('#xmpp-server').val();
            connection = new Strophe.Connection(server);
            connection.rawInput = logInput;
            connection.rawOutput = logOutput;
            connection.connect(
                $('#jid').val(),
                $('#password').val(),
                onConnect
            );
        } else {
            // already connected
            connection.disconnect();
        }
    });

    $('button#send-presence').bind('click', function (e)
    {
        e.preventDefault();
        var parser = new DOMParser();
        var el = parser.parseFromString('<presence />', "text/xml").documentElement;
        connection.send(el);
    });

    $('button#send-xml').click(function (e)
    {
        e.preventDefault()
        var parser = new DOMParser();
        var el = parser.parseFromString($('textarea#xml').val(), "text/xml").documentElement;
        connection.send(el);
    });
});