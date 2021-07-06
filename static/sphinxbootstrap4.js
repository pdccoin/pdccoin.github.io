// When the user scrolls down 36px from the top of the document, show the button

function scrollFunction() {
  if (document.body.scrollTop > 36 || document.documentElement.scrollTop > 36) {
    document.getElementById('btt').style.display='block';
  } else {
    document.getElementById('btt').style.display='none';
  }
}

function sidebarTreeView() {
    var $toctree = $('.sidebartoctree > ul');

    $toctree.find('li').each(function(index, element) {
        $li = $(element).has('ul')

        $li.children('a').append('<a class="arrow collapsed" data-toggle="collapse" href="#collapse' + index + '" aria-expanded="true"></a>').end()
            .children('ul').addClass('collapse').attr({'id': 'collapse' + index}).end();
        if ($li.hasClass('current')) {
            $li.children('ul').addClass('show').end()
                .children('a').children('a').removeClass('collapsed');
        }
    });

}

$(function() {
    $('body').fadeIn(0).scrollspy({ target: 'li.current' });

    // Grid layout Style
    $(".sphinxsidebarwrapper > .sidebartoctree > ul").addClass('nav flex-column nav-pills')
        .find('li').addClass('nav-item').end()
        .find('a.reference').addClass('nav-link').end()

    
    $(".sphinxsidebar").addClass("col-md-3");
    $(".document").addClass("col-md-9");
    sidebarTreeView();
    
    $(".footer").addClass("col-md-12");

    // Tables
    $("table.docutils").addClass("table table-sm table-bordered table-striped")
        .find("thead")
        
        .addClass("thead-inverse")
        

    // Admonition
    $(".admonition").addClass("alert")
        .filter(".hint").addClass("alert-info").children('p.admonition-title').prepend('<div class="icon"><div class="question-mark"></div></div>').end().end()
        .filter(".note, .warning").addClass("alert-warning").children('p.admonition-title').prepend('<div class="icon"><div class="information-mark"></div></div>').end().end()
        .filter(".tip, .important").addClass("alert-success").children('p.admonition-title').prepend('<div class="icon"><div class="check-mark"></div></div>').end().end()
        .filter(".caution, .danger, .error").addClass("alert-danger").children('p.admonition-title').prepend('<div class="icon"><div class="exclamation-mark"></div></div>').end().end();

    // images
    $("img").addClass("img-fluid");

    // download
    $("a.download").prepend('<div class="icon"><div class="download"></div></div>');

    
    

});

function generateDonationUrl(address, amountBtc, message) {
    var result = [
        address
    ];

    amountBtc = parseFloat(amountBtc);

    if (!isNaN(amountBtc)) {
        result.push('?amount=' + amountBtc);
    }

    if (message !== '') {
        message = encodeURIComponent(message);
        result.push(result.length === 1 ? '?' : '&');
        result.push('message=' + message);
    }

    return result.join('');
}

function generateDonationQrCode() {
    var qrcodeContainer = $('#donation-qr-code');
    qrcodeContainer.empty();

    var address = qrcodeContainer.data('address');
    var amount = $('#donation-input-amount-btc').val();
    var message = $('#donation-input-message').val();

    var text = 'pandora:' + generateDonationUrl(address, amount, message);

    $('#donation-qr-code').qrcode({
        width: 150,
        height: 150,
        text: text
    });

}

function loadTickerPrices() {
    $.ajax('https://apiv2.pandoraaverage.com/indices/global/ticker/short?crypto=PDC&fiat=USD').then(function(data) {
        var rate = data.BTCUSD.last;

        function usdToBtc(amount) {
            var amountUsd = parseFloat(amount);
            if (isNaN(amountUsd)) {
                return 0;
            }
            var amountBtc = amountUsd / rate;
            return amountBtc.toFixed(8);
        }

        function btcToUsd(amount) {
            var amountBtc = parseFloat(amount);
            if (isNaN(amountBtc)) {
                return 0;
            }
            var amountUsd = amountBtc * rate;
            return amountUsd.toFixed(2);
        }

        $('#donation-input-amount-usd').on('input', function() {
            var amount = $(this).val();
            $('#donation-input-amount-btc').val(usdToBtc(amount));
            generateDonationQrCode();
        });

        $('#donation-input-amount-btc').on('input', function() {
            var amount = $(this).val();
            $('#donation-input-amount-usd').val(btcToUsd(amount));
            generateDonationQrCode();
        });

        $('#donation-input-message').on('input', function() {
            generateDonationQrCode();
        });

        $('[data-amount-usd]').each(function() {
            var amountUsd = $(this).data('amount-usd');
            var amountBtc = usdToBtc(amountUsd);
            $('div', this).text('(' + amountBtc + ' PDC)');

            $(this).on('click', function() {
                $('#donation-input-amount-btc').val(amountBtc);
                $('#donation-input-amount-usd').val(amountUsd);

                generateDonationQrCode();
            });
        });
    });
}

function openDonationModal() {
    var drop = $('<div class="modal-drop" />');
    var body = $('body');
    var modal = $('#donation-modal');
    body.append(drop);
    body.css('overflow', 'hidden');
    modal.css('display', 'block');

    drop.on('click', closeDonationModal);

    // postpone opacity update
    setTimeout(function() {
        drop.css('opacity', 1);
        modal.removeClass('hidden');
        modal.addClass('open');
    }, 0);

    loadTickerPrices();
    generateDonationQrCode();
}

function closeDonationModal() {
    var drop = $('.modal-drop');
    var body = $('body');
    var modal = $('#donation-modal');

    drop.css('opacity', 0);
    body.css('overflow', 'auto');

    setTimeout(function() {
        drop.remove();
        modal.addClass('hidden');
        modal.removeClass('open');
        modal.css('display', 'none');
    }, 120);
}