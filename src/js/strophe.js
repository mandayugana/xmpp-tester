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
    $('#xml-send-form button').prop('disabled', false);
    $('button#send-xml').prop('disabled', false);
    // collapse connection form
    $('#xmpp-connection-form').collapse('hide');
}

function disconnected()
{
    $('button#xmpp-connection').text('Connect');
    $('#xml-send-form button').prop('disabled', true);
    $('button#send-xml').prop('disabled', true);
    // expand connection form
    $('#xmpp-connection-form').collapse('show');
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

    $('#message-template').click(function(e)
    {
        e.preventDefault();
        var template = '<message to="RECIPIENT_USERNAME@' + connection.domain + '" type="chat" id="' + connection.getUniqueId() + '">\n'
            + '  <body></body>\n'
            + '</message>';
        $('textarea#xml').val(template);
    });

    $('#presence-template').click(function(e)
    {
        e.preventDefault();
        var template = '<presence to="RECIPIENT_USERNAME@' + connection.domain + '">\n'
            + '  <show></show>\n'
            + '</presence>';
        $('textarea#xml').val(template);
    });

    $('#iq-template').click(function(e)
    {
        e.preventDefault();
        var template = '<iq type="set" id="' + connection.getUniqueId() + '">\n'
            + '  <query xmlns="QUERY_NAMESPACE"/>\n'
            + '</iq>';
        $('textarea#xml').val(template);
    });
});