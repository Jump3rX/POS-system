
from django.core.mail import EmailMessage
from datetime import datetime, timedelta
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
import io
from django.db import models
from ..models import auto_email_settings, products

def auto_send_email():
    try:
        # if not request.user.is_authenticated:
        #     return Response({'message': 'User not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
        
        settings = auto_email_settings.objects.filter(auto_send = True)

        for setting in settings:

        # Determine time range based on frequency
            now = datetime.now()
            if setting.frequency == 'daily':
                # Start of the current day (midnight)
                start_time = now.replace(hour=0, minute=0, second=0, microsecond=0)
                # Filter for items updated today up to now (e.g., 5 PM when task runs)
            elif setting.frequency == 'weekly':
                # Last 7 days
                start_time = now - timedelta(days=7)
            else:  # 'off'
                print("AUTO SEND OFF")
                #return Response({'message': 'Auto-send is off'}, status=status.HTTP_200_OK)

        # Filter low stock items updated within the time range
            low_stock_items = products.objects.filter(
                stock_quantity__lte=models.F('low_stock_level')
                # updated_at__gte=start_time,
                # updated_at__lte=now  # Ensure it’s up to the current time (e.g., 5 PM)
            )
            
            if not low_stock_items.exists():
                print("No low stock items to report")
                #return Response({'message': 'No low stock items to report'}, status=status.HTTP_200_OK)

        # Generate PDF
            buffer = io.BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter)
            elements = []

            styles = getSampleStyleSheet()
            title = Paragraph(f'Current Low Stock Products on {now.strftime("%Y%m%d")}', styles['Title'])
            elements.append(title)
            elements.append(Spacer(1, 20))

            data = [['Product Code', 'Product Name', 'Current Quantity', 'Low Stock Level']]
            for item in low_stock_items:
                data.append([item.product_code, item.product_name, item.stock_quantity, item.low_stock_level])
            
            table = Table(data)
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 14),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            elements.append(table)
            doc.build(elements)
            buffer.seek(0)

            # Prepare email
            subject = f'Low Stock Report - {now.strftime("%Y-%m-%d")} ({setting.frequency.capitalize()})'
            message = f'Please find attached the low stock report for {setting.frequency} updates.'
            from_email = 'conradmax5@gmail.com'
            recipient_list = ['njoraconrad@protonmail.com']

            # Send email
            email = EmailMessage(subject, message, from_email, recipient_list)
            email.attach(
                f'low_stock_report_{now.strftime("%Y%m%d")}.pdf',
                buffer.getvalue(),
                'application/pdf'
            )
            email.send()

            # Update last sent timestamp
            # settings.last_sent = now
            # settings.save()

            print("EMail SENT")
            #return Response({'message': 'Email sent!'}, status=status.HTTP_200_OK)

    except models.FieldError as e:
        print(e)
        # return Response(
        #     {'message': 'Field error in database query', 'error': str(e)},
        #     status=status.HTTP_400_BAD_REQUEST
        # )
    except Exception as e:
        print(e)
        # return Response(
        #     {'message': 'Email not sent!', 'error': str(e)},
        #     status=status.HTTP_400_BAD_REQUEST
        # )