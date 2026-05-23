"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Store, MapPin, Clock, Phone, Navigation } from "lucide-react";

export default function StoresPage() {
  const storeLocations = [
    { name: "MIP Flagship Store - Bangalore", address: "12, Commercial Street, Tasker Town, Shivaji Nagar, Bengaluru, Karnataka 560001", hours: "10:30 AM - 8:30 PM", phone: "+91 80 4124 9901", active: true },
    { name: "MIP Boutique - Mumbai", address: "Shop 4, Ground Floor, Hughes Road, Chowpatty, Mumbai, Maharashtra 400007", hours: "11:00 AM - 9:00 PM", phone: "+91 22 2368 4402", active: true },
    { name: "MIP Showroom - Hyderabad", address: "Plot 82, Jubilee Hills Road No. 36, Near Metro Station, Hyderabad, Telangana 500033", hours: "10:30 AM - 8:30 PM", phone: "+91 40 4012 3345", active: true },
    { name: "MIP Outlet - Chennai", address: "Express Avenue Mall, Shop S-18, Royapettah, Chennai, Tamil Nadu 600014", hours: "10:00 AM - 10:00 PM", phone: "+91 44 2846 4110", active: false }
  ];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 font-sans">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-secondary uppercase text-slate-800 flex items-center gap-2">
            <Store className="w-8 h-8 text-amber-500" /> Retail Store Locations
          </h2>
          <p className="text-sm text-slate-500">
            Manage physical retail outlets, contact information, trading hours, and location pointers displayed on the site.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button className="bg-slate-900 text-white hover:bg-slate-800 transition-colors">
            <Plus className="mr-2 h-4 w-4" /> Add Store Location
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {storeLocations.map((st) => (
          <Card key={st.name} className="overflow-hidden border-slate-100 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
            <div>
              <CardHeader className="bg-slate-50/50 pb-3 border-b border-slate-100/50">
                <div className="flex justify-between items-center">
                  <Badge variant={st.active ? "default" : "secondary"} className={st.active ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-100 text-slate-500"}>
                    {st.active ? "Open" : "Temporarily Closed"}
                  </Badge>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Boutique</span>
                </div>
                <CardTitle className="text-lg font-secondary uppercase text-slate-800 tracking-wider mt-2">
                  {st.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <p className="text-xs text-slate-600 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>{st.address}</span>
                </p>
                <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{st.hours}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{st.phone}</span>
                  </div>
                </div>
              </CardContent>
            </div>
            <CardContent className="pt-0 border-t border-slate-50 py-3 flex justify-end">
              <Button variant="ghost" size="sm" className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 mr-1" /> Get Directions
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
