# Deploying Workout Vision to AWS EC2

This guide walks through the process of deploying the Workout Vision application to an AWS EC2 instance.

## Prerequisites

- AWS account with permissions to create EC2 instances
- Basic knowledge of AWS services
- SSH client for connecting to the EC2 instance
- The Workout Vision codebase

## Step 1: Set Up an EC2 Instance

1. **Launch an EC2 instance**:
   - Log in to the AWS Management Console
   - Navigate to EC2 service
   - Click "Launch Instance"
   - Choose an Ubuntu Server (recommended: Ubuntu 22.04 LTS)
   - Select an instance type (recommended: t2.medium or larger due to video processing requirements)
   - Configure instance details (default settings are usually fine)
   - Add storage (at least 20GB recommended)
   - Add tags (optional)
   - Configure security group:
     - Allow SSH (port 22) from your IP
     - Allow HTTP (port 80) from anywhere
     - Allow HTTPS (port 443) from anywhere
     - Allow custom TCP on port 8000 (or your configured API_PORT) from anywhere
   - Review and launch
   - Create or select an existing key pair for SSH access

2. **Connect to your instance**:
   ```bash
   ssh -i /path/to/your-key.pem ubuntu@your-instance-public-dns
   ```

## Step 2: Install Dependencies

1. **Update the system**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo apt install -y software-properties-common
   sudo add-apt-repository -y ppa:deadsnakes/ppa
   ```

2. **Install Python and pip**:
   ```bash
   sudo apt install -y python3.11 python3.11-venv python3.11-dev
   sudo update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.11 1
   ```

3. **Install system dependencies for OpenCV**:
   ```bash
   sudo apt install -y libgl1 libglib2.0-0 python3-opencv
   ```

4. **Install Nginx for reverse proxy (optional but recommended)**:
   ```bash
   sudo apt install -y nginx
   ```

## Step 3: Set Up the Application

1. **Create a directory for the application**:
   ```bash
   mkdir -p ~/workout_vision
   ```

2. **Upload the code to the EC2 instance**:
   Option 1: Use SCP to transfer files:
   ```bash
   scp -i /path/to/your-key.pem -r /path/to/local/Workout_Vision/* ubuntu@your-instance-public-dns:~/workout_vision/
   ```
   
   Option 2: Clone from a Git repository (if available):
   ```bash
   git clone https://your-repository-url.git ~/workout_vision
   ```

3. **Create a virtual environment**:
   ```bash
   cd ~/workout_vision
   python3 -m venv venv
   source venv/bin/activate
   ```

4. **Install Python dependencies**:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

5. **Create a .env file**:
   ```bash
   nano .env
   ```
   
   Add the following content (replace with your actual values):
   ```
   OPENAI_API_KEY=your_openai_api_key
   SUPABASE_KEY=your_supabase_api_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_BUCKET=your_supabase_bucket
   API_HOST=0.0.0.0
   API_PORT=8000
   ALLOWED_VIDEO_DOMAINS=supabase.co
   ```

## Step 4: Set Up a Systemd Service

1. **Create a systemd service file**:
   ```bash
   sudo nano /etc/systemd/system/workout-vision.service
   ```

2. **Add the following content**:
   ```
   [Unit]
   Description=Workout Vision FastAPI Application
   After=network.target

   [Service]
   User=ubuntu
   Group=ubuntu
   WorkingDirectory=/home/ubuntu/workout_vision
   Environment="PATH=/home/ubuntu/workout_vision/venv/bin"
   ExecStart=/home/ubuntu/workout_vision/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000

   [Install]
   WantedBy=multi-user.target
   ```

3. **Enable and start the service**:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable workout-vision
   sudo systemctl start workout-vision
   ```

4. **Check the service status**:
   ```bash
   sudo systemctl status workout-vision
   ```

## Step 5: Set Up Nginx as a Reverse Proxy (Optional but Recommended)

1. **Create an Nginx configuration file**:
   ```bash
   sudo nano /etc/nginx/sites-available/workout-vision
   ```

2. **Add the following content**:
   ```
   server {
       listen 80;
       server_name your_domain_or_ip;

       location / {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

3. **Enable the site and restart Nginx**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/workout-vision /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## Step 6: Set Up SSL with Let's Encrypt (Optional)

1. **Install Certbot**:
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   ```

2. **Obtain and install SSL certificate**:
   ```bash
   sudo certbot --nginx -d your_domain
   ```

## Step 7: Test the Deployment

1. **Check if the API is running**:
   ```bash
   curl http://localhost:8000/
   ```

2. **Test from external client**:
   Open a web browser and navigate to:
   ```
   http://your_domain_or_ip/
   ```
   
   Or if you've set up SSL:
   ```
   https://your_domain/
   ```

## Troubleshooting

1. **Check application logs**:
   ```bash
   sudo journalctl -u workout-vision
   ```

2. **Check Nginx logs**:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   sudo tail -f /var/log/nginx/access.log
   ```

3. **Common issues**:
   - Port 8000 not accessible: Check security group settings
   - Application not starting: Check the .env file and systemd service configuration
   - Dependencies issues: Make sure all system dependencies are installed

## Maintenance

1. **Update the application**:
   ```bash
   cd ~/workout_vision
   git pull  # If using git
   source venv/bin/activate
   pip install -r requirements.txt
   sudo systemctl restart workout-vision
   ```

2. **Monitor disk usage**:
   ```bash
   df -h
   ```
   
   The application stores images and audio files, so monitor storage usage regularly.

3. **Backup important data**:
   ```bash
   sudo tar -czvf /tmp/workout_vision_backup.tar.gz ~/workout_vision
   ```

## Security Considerations

1. **Restrict API access** if needed by updating security groups
2. **Set up proper authentication** for your API if it will be publicly accessible
3. **Regularly update** the system and dependencies
4. **Monitor logs** for suspicious activities 