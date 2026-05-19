"use client";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { axiosInstance } from "@/lib/api";

interface Settings {
  companyName?: string;
  companyEmail?: string;
  companyPhone?: string;
  companyAddress?: string;
  companyDescription?: string;
  supportEmail?: string;
  supportPhone?: string;
  address?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
}

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = useState<Settings>({});

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axiosInstance.get("/api/settings/public");
        if (response.data.success) {
          setSettings(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };
    fetchSettings();
  }, []);

  const footerLinks = [
    { text: "Home", href: "/" },
    { text: "About Us", href: "/about" },
    { text: "Plans", href: "/plans" },
    { text: "Contact", href: "/contact" },
  ];

  const socialLinks = [
    { icon: Facebook, url: settings.facebookUrl, label: "Facebook" },
    { icon: Twitter, url: settings.twitterUrl, label: "Twitter" },
    { icon: Instagram, url: settings.instagramUrl, label: "Instagram" },
    { icon: Linkedin, url: settings.linkedinUrl, label: "LinkedIn" },
  ].filter((s) => s.url);

  return (
    <footer className="bg-base-50 border-t border-border">
      <div className="container mx-auto px-6 py-12 md:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/assets/images/logo/vsv-unite-new.jpeg"
                alt={`${settings.companyName || 'VSV Unite'} Logo`}
                width={56}
                height={56}
                className="w-14 h-14 object-contain"
              />
              <span className="text-2xl font-bold text-foreground">{settings.companyName || 'VSV Unite'}</span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-sm">
              {settings.companyDescription || 'Building transparent and automated network income opportunities for thousands of successful members worldwide.'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary-600 transition-colors text-sm"
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Contact Us</h3>
            <div className="space-y-3 text-sm">
              {(settings.companyEmail || settings.supportEmail) && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4 text-primary-500" />
                  <a href={`mailto:${settings.companyEmail || settings.supportEmail}`} className="hover:text-primary-600 transition-colors">
                    {settings.companyEmail || settings.supportEmail}
                  </a>
                </div>
              )}
              {(settings.companyPhone || settings.supportPhone) && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4 text-primary-500" />
                  <a href={`tel:${(settings.companyPhone || settings.supportPhone || '').replace(/\s/g, '')}`} className="hover:text-primary-600 transition-colors">
                    {settings.companyPhone || settings.supportPhone}
                  </a>
                </div>
              )}
              {(settings.companyAddress || settings.address) && (
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 text-primary-500 mt-0.5" />
                  <span>{settings.companyAddress || settings.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Copyright */}
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {currentYear} {settings.companyName || 'VSV Unite'}. All rights reserved.
          </p>

          {/* Social Links - only show if URLs exist in settings */}
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 hover:bg-primary-400 hover:text-primary-foreground transition-all"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
