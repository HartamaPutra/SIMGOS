Ext.define(null, {
    override: "rekammedis.perencanaan.jadwalkontrol.Form",
    onLoadRecord: function (a, b) {
        a.callParent([a, b]);
        a.recBefore = Ext.clone(b);
        a.setFormConfig({
            nomorAntrian: true
        })
    }
});
Ext.define(null, {
    override: "rekammedis.perencanaan.jadwalkontrol.FormController",
    tujuanSelected: undefined,
    antrian: {
        service: undefined
    },
    init: function () {
        var a = this;
        a.callParent();
        a.antrian.service = Ext.create("antrian.Service", {})
    },
    onGetAntrian: function (s, h) {
        var I = this,
            r = I.getView(),
            E = I.getViewModel(),
            b = E.get("kjgn"),
            l = r.getRecord();
        if (!l) {
            return
        }
        var x = r.down("[name=NOMOR_ANTRIAN]"),
            f = r.down("[name=NOMOR_BOOKING]"),
            a = r.down("[name=NOMOR_REFERENSI]"),
            e = x.getValue(),
            q = a.getValue(),
            j = r.down("[name=TANGGAL]").getValue(),
            n = r.down("[name=RUANGAN]").getValue(),
            y = r.down("[name=JAM]").getValue(),
            v = E.get("dpjpPjmnRS"),
            z = r.down("dokter-combo"),
            B = z.getSelection(),
            o = Ext.Date.format(j, "Y-m-d"),
            m = Ext.Date.format(l.get("TANGGAL"), "Y-m-d"),
            w = r.getReferensi(b, "PENDAFTARAN"),
            D = r.getReferensi(w, "PASIEN"),
            H = r.getReferensi(w.PENJAMIN, "KAP") ? r.getReferensi(w.PENJAMIN, "KAP") : "",
            d = I.tujuanSelected ? r.getReferensi(I.tujuanSelected, "PENJAMIN_SUB_SPESIALISTIK") : null,
            p = v ? v.findRecord("DPJP_RS", B.get("ID"), 0, false, true, true) : null;
        ps = null;
        if (d) {
            d.forEach(function (t) {
                if (t.PENJAMIN == 2) {
                    ps = t
                }
            })
        }
        if (o == m && e != "" && B.get("ID") == l.get("DOKTER")) {
            if (Ext.isFunction(h)) {
                h(null)
            }
            return
        }
        if (!I.antrian.service) {
            return
        }
        var G, u = "";
        if (D) {
            if (D.KARTUIDENTITAS) {
                if (Ext.isArray(D.KARTUIDENTITAS)) {
                    D.KARTUIDENTITAS.forEach(function (t) {
                        if (t.JENIS == 1) {
                            u = t.NOMOR
                        }
                    })
                }
            }
            if (D.KONTAK) {
                if (Ext.isArray(D.KONTAK)) {
                    D.KONTAK.forEach(function (t) {
                        if (t.JENIS == 3) {
                            G = t.NOMOR
                        }
                    })
                }
            }
        }
        var g = Ext.getStore("instansi"),
            A = "",
            g = g ? g.getAt(0) : null;
        if (g) {
            A = g.get("REFERENSI").PPK.BPJS
        }
        A = A ? A : g.get("REFERENSI").PPK.KODE;
        var k = "";
        if (B) {
            var C = r.getReferensi(B.getData(), "JADWAL_DOKTER", "jadwalPraktek");
            k = C ? C.split(" ").join("") : Ext.Date.format(y, "H:i:00");
            isofline = C ? 0 : 1
        }
        var F = {
            NIK: u,
            NAMA: D ? D.NAMA : "",
            ALAMAT: D ? D.ALAMAT : "",
            TANGGAL_LAHIR: D ? D.TANGGAL_LAHIR : null,
            CONTACT: G,
            JENIS: 1,
            JENIS_APLIKASI: 3,
            REF: b.NOMOR,
            NORM: w.NORM,
            CARABAYAR: w.PENJAMIN ? w.PENJAMIN.JENIS : 1,
            NO_KARTU_BPJS: H.NOMOR ? H.NOMOR : "",
            NO_REF_BPJS: q,
            JENIS_KUNJUNGAN: l.get("BERULANG") == 1 ? 3 : 2,
            POLI_BPJS: ps ? ps.SUB_SPESIALIS_PENJAMIN : "",
            POLI: n,
            JAM_PRAKTEK: k,
            TANGGALKUNJUNGAN: o,
            DOKTER: p ? p.get("DPJP_PENJAMIN") : "",
            STATUS: 1,
            IS_OFFLINE: isofline
        };
        if (r.getPropertyConfig("900311") == "TRUE") {
            r.showMessageBox({
                title: "Antrian",
                message: "Anda yakin ingin mengambil nomor antrian ?",
                ui: "window-red",
                buttons: Ext.Msg.YESNO,
                icon: Ext.Msg.QUESTION,
                animateTarget: s,
                fn: function (t) {
                    if (t === "yes") {
                        r.setLoading(true);
                        I.antrian.service.createAntrian(F, function (K, L, J) {
                            r.notifyMessage(L.metadata.message);
                            if (L.success) {
                                x.setValue(L.response.nomorantrean);
                                f.setValue(L.response.kodebooking)
                            }
                            r.setLoading(false);
                            if (Ext.isFunction(h)) {
                                h(L)
                            }
                        })
                    }
                }
            })
        } else {
            r.setLoading(true);
            I.antrian.service.createAntrian(F, function (J, K, t) {
                r.notifyMessage(K.metadata.message);
                if (K.success) {
                    x.setValue(K.response.nomorantrean);
                    f.setValue(K.response.kodebooking)
                }
                r.setLoading(false);
                if (Ext.isFunction(h)) {
                    h(K)
                }
            })
        }
    }
});
Ext.define("antrian.antrianpoli.Model", {
    extend: "data.model.Model",
    serviceName: "registrasionline/antrianpoli",
    fields: [{
        name: "ASAL_REF",
        type: "int"
    }, {
        name: "REF",
        type: "string"
    }, {
        name: "NOMOR",
        type: "int"
    }, {
        name: "POLI",
        type: "string"
    }, {
        name: "TANGGAL",
        type: "date",
        dateFormat: "Y-m-d"
    }, {
        name: "STATUS",
        type: "int",
        defaultValue: 1
    }]
});
Ext.define("antrian.antrianpoli.Store", {
    extend: "data.store.Store",
    model: "antrian.antrianpoli.Model",
    alias: "store.antrian-antrianpoli-store"
});
Ext.define("antrian.carabayar.Model", {
    extend: "data.model.Model",
    serviceName: "registrasionline/carabayar",
    fields: [{
        name: "ID",
        type: "int"
    }, {
        name: "DESKRIPSI",
        type: "string"
    }, {
        name: "STATUS",
        type: "int",
        defaultValue: 1
    }],
    idProperty: "ID"
});
Ext.define("antrian.carabayar.Store", {
    extend: "data.store.Store",
    model: "antrian.carabayar.Model",
    alias: "store.antrian-carabayar-store"
});
Ext.define("antrian.hfis.antrean.belumdilayani.Model", {
    extend: "data.model.Model",
    serviceName: "registrasionline/bpjs/getAntreanBelumDilayani",
    fields: []
});
Ext.define("antrian.hfis.antrean.belumdilayani.Store", {
    extend: "data.store.Store",
    model: "antrian.hfis.antrean.belumdilayani.Model",
    alias: "store.antrian-hfis-antrean-belumdilayani-store"
});
Ext.define("antrian.hfis.antrean.jadwaldokter.Model", {
    extend: "data.model.Model",
    serviceName: "registrasionline/bpjs/getAntreanBelumDilayaniPerJadwalDokter",
    fields: []
});
Ext.define("antrian.hfis.antrean.jadwaldokter.Store", {
    extend: "data.store.Store",
    model: "antrian.hfis.antrean.jadwaldokter.Model",
    alias: "store.antrian-hfis-antrean-jadwaldokter-store"
});
Ext.define("antrian.hfis.antrean.kodebooking.Model", {
    extend: "data.model.Model",
    serviceName: "registrasionline/bpjs/getAntreanPerKodeBooking",
    fields: []
});
Ext.define("antrian.hfis.antrean.kodebooking.Store", {
    extend: "data.store.Store",
    model: "antrian.hfis.antrean.kodebooking.Model",
    alias: "store.antrian-hfis-antrean-kodebooking-store"
});
Ext.define("antrian.hfis.antrean.tanggal.Model", {
    extend: "data.model.Model",
    serviceName: "registrasionline/bpjs/getAntreanPerTanggal",
    fields: []
});
Ext.define("antrian.hfis.antrean.tanggal.Store", {
    extend: "data.store.Store",
    model: "antrian.hfis.antrean.tanggal.Model",
    alias: "store.antrian-hfis-antrean-tanggal-store"
});
Ext.define("antrian.hfis.dashboard.bulan.Model", {
    extend: "data.model.Model",
    serviceName: "registrasionline/bpjs/getDashboardBulan",
    fields: []
});
Ext.define("antrian.hfis.dashboard.bulan.Store", {
    extend: "data.store.Store",
    model: "antrian.hfis.dashboard.bulan.Model",
    alias: "store.antrian-hfis-dashboard-bulan-store"
});
Ext.define("antrian.hfis.dashboard.grafik.local.Model", {
    extend: "data.model.Model",
    serviceName: "registrasionline/plugins/getGrafikDashboard",
    fields: []
});
Ext.define("antrian.hfis.dashboard.grafik.local.Store", {
    extend: "data.store.Store",
    model: "antrian.hfis.dashboard.grafik.local.Model",
    alias: "store.antrian-hfis-dashboard-grafik-local-store"
});
Ext.define("antrian.hfis.dashboard.tanggal.Model", {
    extend: "data.model.Model",
    serviceName: "registrasionline/bpjs/getDashboardTanggal",
    fields: []
});
Ext.define("antrian.hfis.dashboard.tanggal.Store", {
    extend: "data.store.Store",
    model: "antrian.hfis.dashboard.tanggal.Model",
    alias: "store.antrian-hfis-dashboard-tanggal-store"
});
Ext.define("antrian.hfis.dokter.Model", {
    extend: "data.model.Model",
    serviceName: "registrasionline/bpjs/getReferensiDokter",
    fields: [{
        name: "ID",
        type: "int"
    }, {
        name: "KODE",
        type: "string"
    }, {
        name: "NAMA",
        type: "string"
    }, {
        name: "STATUS",
        type: "int"
    }],
    idProperty: "ID"
});
Ext.define("antrian.hfis.dokter.Store", {
    extend: "data.store.Store",
    model: "antrian.hfis.dokter.Model",
    alias: "store.antrian-hfis-dokter-store"
});
Ext.define("antrian.hfis.jadwaldokter.Model", {
    extend: "data.model.Model",
    serviceName: "registrasionline/jadwaldokterhfis",
    fields: [{
        name: "ID",
        type: "int"
    }, {
        name: "KD_DOKTER",
        type: "string"
    }, {
        name: "NM_DOKTER",
        type: "string"
    }, {
        name: "KD_SUB_SPESIALIS",
        type: "int"
    }, {
        name: "NM_SUB_SPESIALIS",
        type: "string"
    }, {
        name: "KD_POLI",
        type: "string"
    }, {
        name: "NM_POLI",
        type: "string"
    }, {
        name: "HARI",
        type: "int"
    }, {
        name: "TANGGAL",
        type: "date",
        dateFormat: "Y-m-d"
    }, {
        name: "NM_HARI",
        type: "string"
    }, {
        name: "JAM",
        type: "string"
    }, {
        name: "KAPASITAS",
        type: "int"
    }, {
        name: "LIBUR",
        type: "int"
    }, {
        name: "STATUS",
        type: "int"
    }],
    idProperty: "ID"
});
Ext.define("antrian.hfis.jadwaldokter.Store", {
    extend: "data.store.Store",
    model: "antrian.hfis.jadwaldokter.Model",
    alias: "store.antrian-hfis-jadwaldokter-store"
});
Ext.define("antrian.hfis.jadwaldokter.referensi.Model", {
    extend: "data.model.Model",
    serviceName: "registrasionline/bpjs/getJadwalDokterHfis",
    fields: [{
        name: "ID",
        type: "int"
    }, {
        name: "KD_DOKTER",
        type: "string"
    }, {
        name: "NM_DOKTER",
        type: "string"
    }, {
        name: "KD_SUB_SPESIALIS",
        type: "int"
    }, {
        name: "NM_SUB_SPESIALIS",
        type: "string"
    }, {
        name: "KD_POLI",
        type: "string"
    }, {
        name: "NM_POLI",
        type: "string"
    }, {
        name: "HARI",
        type: "int"
    }, {
        name: "TANGGAL",
        type: "date",
        dateFormat: "Y-m-d"
    }, {
        name: "NM_HARI",
        type: "string"
    }, {
        name: "JAM",
        type: "string"
    }, {
        name: "KAPASITAS",
        type: "int"
    }, {
        name: "LIBUR",
        type: "int"
    }, {
        name: "STATUS",
        type: "int"
    }],
    idProperty: "ID"
});
Ext.define("antrian.hfis.jadwaldokter.referensi.Store", {
    extend: "data.store.Store",
    model: "antrian.hfis.jadwaldokter.referensi.Model",
    alias: "store.antrian-hfis-jadwaldokter-referensi-store"
});
Ext.define("antrian.hfis.taskid.Model", {
    extend: "data.model.Model",
    serviceName: "registrasionline/bpjs/getListTaskId",
    fields: []
});
Ext.define("antrian.hfis.taskid.Store", {
    extend: "data.store.Store",
    model: "antrian.hfis.taskid.Model",
    alias: "store.antrian-hfis-taskid-store"
});
Ext.define("antrian.jadwal.Model", {
    extend: "data.model.Model",
    serviceName: "registrasionline/jadwaldokter",
    fields: [{
        name: "ID",
        type: "int"
    }, {
        name: "DOKTER",
        type: "string"
    }, {
        name: "RUANGAN",
        type: "string"
    }, {
        name: "HARI",
        type: "int"
    }, {
        name: "MULAI",
        type: "string"
    }, {
        name: "SELESAI",
        type: "string"
    }, {
        name: "TANGGAL_AWAL",
        type: "date",
        dateFormat: "Y-m-d"
    }, {
        name: "TANGGAL_AKHIR",
        type: "date",
        dateFormat: "Y-m-d"
    }, {
        name: "STATUS",
        type: "int"
    }],
    idProperty: "ID"
});
Ext.define("antrian.jadwal.Store", {
    extend: "data.store.Store",
    model: "antrian.jadwal.Model",
    alias: "store.antrian-jadwal-store"
});
Ext.define("antrian.jadwal.pergantian.Model", {
    extend: "data.model.Model",
    serviceName: "registrasionline/jadwaldokter/pergantian/detail",
    fields: [{
        name: "ID_PERGANTIAN",
        type: "int"
    }, {
        name: "ID_TANGGAL",
        type: "string"
    }, {
        name: "STATUS",
        type: "int"
    }]
});
Ext.define("antrian.jadwal.pergantian.Store", {
    extend: "data.store.Store",
    model: "antrian.jadwal.pergantian.Model",
    alias: "store.antrian-jadwal-pergantian-store"
});
Ext.define("antrian.jadwal.tanggal.Model", {
    extend: "data.model.Model",
    serviceName: "registrasionline/jadwal/tanggal",
    fields: [{
        name: "ID",
        type: "int"
    }, {
        name: "DOKTER",
        type: "string"
    }, {
        name: "RUANGAN",
        type: "string"
    }, {
        name: "HARI",
        type: "int"
    }, {
        name: "MULAI",
        type: "string"
    }, {
        name: "SELESAI",
        type: "string"
    }, {
        name: "TANGGAL_AWAL",
        type: "date",
        dateFormat: "Y-m-d"
    }, {
        name: "TANGGAL_AKHIR",
        type: "date",
        dateFormat: "Y-m-d"
    }, {
        name: "STATUS",
        type: "int"
    }],
    idProperty: "ID"
});
Ext.define("antrian.jadwal.tanggal.Store", {
    extend: "data.store.Store",
    model: "antrian.jadwal.tanggal.Model",
    alias: "store.antrian-jadwal-tanggal-store"
});
Ext.define("antrian.jenispasien.Model", {
    extend: "data.model.Model",
    serviceName: "registrasionline/jenispasien",
    fields: [{
        name: "ID",
        type: "int"
    }, {
        name: "DESKRIPSI",
        type: "string"
    }],
    idProperty: "ID"
});
Ext.define("antrian.jenispasien.Store", {
    extend: "data.store.Store",
    model: "antrian.jenispasien.Model",
    alias: "store.antrian-jenispasien-store"
});
Ext.define("antrian.monitoring.kemkes.jadwaldokter.Model", {
    extend: "data.model.Model",
    serviceName: "kemkes/jadwal/dokter",
    fields: [{
        name: "ID",
        type: "int"
    }, {
        name: "KLINIK",
        type: "string"
    }, {
        name: "DOKTER",
        type: "string"
    }, {
        name: "HARI",
        type: "int"
    }, {
        name: "JAM_MULAI",
        type: "string"
    }, {
        name: "JAM_TUTUP",
        type: "string"
    }, {
        name: "KUOTA",
        type: "int"
    }, {
        name: "STATUS",
        type: "int",
        defaultValue: 1
    }],
    idProperty: "ID"
});
Ext.define("antrian.monitoring.kemkes.jadwaldokter.Store", {
    extend: "data.store.Store",
    model: "antrian.monitoring.kemkes.jadwaldokter.Model",
    alias: "store.antrian-monitoring-kemkes-jadwaldokter-store"
});
Ext.define("antrian.monitoring.kemkes.reservasi.Model", {
    extend: "data.model.Model",
    serviceName: "kemkes/reservasi/antrian",
    fields: [{
        name: "ID",
        type: "int"
    }, {
        name: "PASIEN",
        type: "int"
    }, {
        name: "NAMA",
        type: "string"
    }, {
        name: "TEMPAT_LAHIR",
        type: "date"
    }, {
        name: "TANGGAL_LAHIR",
        type: "date"
    }, {
        name: "KONTAK",
        type: "string"
    }, {
        name: "JENIS",
        type: "int"
    }, {
        name: "TANGGAL_DAFTAR",
        type: "date"
    }, {
        name: "TANGGAL_KUNJUNGAN",
        type: "date"
    }, {
        name: "RUANGAN",
        type: "string"
    }, {
        name: "DOKTER",
        type: "string"
    }, {
        name: "PENJAMIN",
        type: "string"
    }, {
        name: "NOMOR",
        type: "int"
    }, {
        name: "JAM",
        type: "string"
    }, {
        name: "STATUS",
        type: "int",
        defaultValue: 1
    }],
    idProperty: "ID"
});
Ext.define("antrian.monitoring.kemkes.reservasi.Store", {
    extend: "data.store.Store",
    model: "antrian.monitoring.kemkes.reservasi.Model",
    alias: "store.antrian-monitoring-kemkes-reservasi-store"
});
Ext.define("antrian.kirimantrian.Model", {
    extend: "data.model.Model",
    serviceName: "registrasionline/plugins/kirimAntrian",
    fields: []
});
Ext.define("antrian.kirimantrian.Store", {
    extend: "data.store.Store",
    model: "antrian.kirimantrian.Model",
    alias: "store.antrian-kirimantrian-store"
});
Ext.define("antrian.kirimantrian.rsonline.Model", {
    extend: "data.model.Model",
    serviceName: "registrasionline/rsonline/kirimAntrian",
    fields: []
});
Ext.define("antrian.kirimantrian.rsonline.db.Model", {
    extend: "data.model.Model",
    serviceName: "registrasionline/logreservasirsonline",
    fields: [{
        name: "kodebooking",
        type: "string"
    }, {
        name: "jenispasien",
        type: "string"
    }, {
        name: "nik",
        type: "string"
    }, {
        name: "nohp",
        type: "string"
    }, {
        name: "kodepoli",
        type: "string"
    }, {
        name: "namapoli",
        type: "string"
    }, {
        name: "pasienbaru",
        type: "int"
    }, {
        name: "norm",
        type: "string"
    }, {
        name: "tanggalperiksa",
        type: "date",
        dateFormat: "Y-m-d"
    }, {
        name: "jeniskunjungan",
        type: "string"
    }, {
        name: "nomorantrean",
        type: "string"
    }, {
        name: "angkaantrean",
        type: "int"
    }, {
        name: "estimasidilayani",
        type: "int"
    }, {
        name: "status",
        type: "int"
    }, {
        name: "response",
        type: "string"
    }, {
        name: "posantrian",
        type: "string"
    }]
});
Ext.define("antrian.kirimantrian.rsonline.db.Store", {
    extend: "data.store.Store",
    model: "antrian.kirimantrian.rsonline.db.Model",
    alias: "store.antrian-kirimantrian-rsonline-db-store"
});
Ext.define("antrian.loket.Model", {
    extend: "data.model.Model",
    serviceName: "registrasionline/loketantrian",
    fields: [{
        name: "ID",
        type: "string"
    }, {
        name: "DESKRIPSI",
        type: "string"
    }, {
        name: "STATUS",
        type: "int"
    }],
    idProperty: "ID"
});
Ext.define("antrian.loket.Store", {
    extend: "data.store.Store",
    model: "antrian.loket.Model",
    alias: "store.antrian-loket-store"
});
Ext.define("antrian.panggilantrian.Model", {
    extend: "data.model.Model",
    serviceName: "registrasionline/panggilantrian",
    fields: [{
        name: "ID",
        type: "int"
    }, {
        name: "LOKET",
        type: "string"
    }, {
        name: "NOMOR",
        type: "int"
    }, {
        name: "POS",
        type: "string"
    }, {
        name: "CARA_BAYAR",
        type: "int"
    }, {
        name: "TANGGAL",
        type: "date",
        dateFormat: "Y-m-d"
    }],
    idProperty: "ID"
});
Ext.define("antrian.panggilantrian.Store", {
    extend: "data.store.Store",
    model: "antrian.panggilantrian.Model",
    alias: "store.antrian-panggilantrian-store"
});
Ext.define("antrian.panggilantrianpoli.Model", {
    extend: "data.model.Model",
    serviceName: "registrasionline/panggilantrianpoli",
    fields: [{
        name: "ID",
        type: "int"
    }, {
        name: "POLI",
        type: "string"
    }, {
        name: "NOMOR",
        type: "int"
    }, {
        name: "TANGGAL",
        type: "date",
        dateFormat: "Y-m-d"
    }],
    idProperty: "ID"
});
Ext.define("antrian.panggilantrianpoli.Store", {
    extend: "data.store.Store",
    model: "antrian.panggilantrianpoli.Model",
    alias: "store.antrian-panggilantrianpoli-store"
});
Ext.define("antrian.pasien.Model", {
    extend: "data.model.Model",
    serviceName: "registrasionline/pasien",
    fields: [{
        name: "NORM",
        type: "int"
    }, {
        name: "NAMA",
        type: "string"
    }, {
        name: "PANGGILAN",
        type: "string"
    }, {
        name: "GELAR_DEPAN",
        type: "string"
    }, {
        name: "GELAR_BELAKANG",
        type: "string"
    }, {
        name: "TEMPAT_LAHIR",
        type: "string"
    }, {
        name: "TANGGAL_LAHIR",
        type: "date",
        dateFormat: "Y-m-d H:t:s"
    }, {
        name: "JENIS_KELAMIN",
        type: "int"
    }, {
        name: "ALAMAT",
        type: "string"
    }, {
        name: "RT",
        type: "string"
    }, {
        name: "RW",
        type: "string"
    }, {
        name: "KODEPOS",
        type: "string"
    }, {
        name: "AGAMA",
        type: "int"
    }, {
        name: "PENDIDIKAN",
        type: "int"
    }, {
        name: "PEKERJAAN",
        type: "int"
    }, {
        name: "STATUS_PERKAWINAN",
        type: "int"
    }, {
        name: "GOLONGAN_DARAH",
        type: "int"
    }, {
        name: "KEWARGANEGARAAN",
        type: "int"
    }, {
        name: "TANGGAL",
        type: "date",
        dateFormat: "Y-m-d H:t:s"
    }, {
        name: "OLEH",
        type: "int"
    }, {
        name: "STATUS",
        type: "int",
        defaultValue: 1
    }],
    idProperty: "NORM"
});
Ext.define("antrian.pasien.Store", {
    extend: "data.store.Store",
    model: "antrian.pasien.Model",
    alias: "store.antrian-pasien-store"
});
Ext.define("antrian.pengaturan.Model", {
    extend: "data.model.Model",
    serviceName: "registrasionline/pengaturan",
    fields: [{
        name: "ID",
        type: "int"
    }, {
        name: "LIMIT_DAFTAR",
        type: "int"
    }, {
        name: "DURASI",
        type: "int"
    }, {
        name: "MULAI",
        type: "date",
        dateFormat: "H:i:s"
    }, {
        name: "STATUS",
        type: "int",
        defaultValue: 1
    }],
    idProperty: "ID"
});
Ext.define("antrian.pengaturan.Store", {
    extend: "data.store.Store",
    model: "antrian.pengaturan.Model",
    alias: "store.antrian-pengaturan-store"
});
Ext.define("antrian.pengunjung.Model", {
    extend: "data.model.Model",
    serviceName: "registrasionline/plugins/getPengunjungTidakAdaAntrian",
    fields: []
});
Ext.define("antrian.pengunjung.Store", {
    extend: "data.store.Store",
    model: "antrian.pengunjung.Model",
    alias: "store.antrian-pengunjung-store"
});
Ext.define("antrian.polibpjs.Model", {
    extend: "data.model.Model",
    serviceName: "registrasionline/refpolibpjs",
    fields: [{
        name: "KDPOLI",
        type: "string"
    }, {
        name: "NMPOLI",
        type: "string"
    }, {
        name: "ANTRIAN",
        type: "int"
    }, {
        name: "STATUS",
        type: "int",
        defaultValue: 1
    }],
    idProperty: "KDPOLI"
});
Ext.define("antrian.polibpjs.Store", {
    extend: "data.store.Store",
    model: "antrian.polibpjs.Model",
    alias: "store.antrian-polibpjs-store"
});
Ext.define("antrian.polibpjs.referensi.Model", {
    extend: "data.model.Model",
    serviceName: "registrasionline/bpjs/getRefPoli",
    fields: []
});
Ext.define("antrian.polibpjs.referensi.Store", {
    extend: "data.store.Store",
    model: "antrian.polibpjs.referensi.Model",
    alias: "store.antrian-polibpjs-referensi-store"
});
Ext.define("antrian.posantrian.Model", {
    extend: "data.model.Model",
    serviceName: "registrasionline/posantrian",
    fields: [{
        name: "ID",
        type: "int"
    }, {
        name: "DESKRIPSI",
        type: "string"
    }, {
        name: "STATUS",
        type: "int",
        defaultValue: 1
    }],
    idProperty: "ID"
});
Ext.define("antrian.posantrian.Store", {
    extend: "data.store.Store",
    model: "antrian.posantrian.Model",
    alias: "store.antrian-posantrian-store"
});
Ext.define("antrian.reservasi.Model", {
    extend: "data.model.Model",
    serviceName: "registrasionline/reservasi",
    fields: [{
        name: "ID",
        type: "string"
    }, {
        name: "TANGGALKUNJUNGAN",
        type: "date",
        dateFormat: "Y-m-d"
    }, {
        name: "NORM",
        type: "int"
    }, {
        name: "NAMA",
        type: "string"
    }, {
        name: "TEMPAT_LAHIR",
        type: "string"
    }, {
        name: "TANGGAL_LAHIR",
        type: "date",
        dateFormat: "Y-m-d"
    }, {
        name: "ALAMAT",
        type: "string"
    }, {
        name: "PEKERJAAN",
        type: "int"
    }, {
        name: "INSTANSI_ASAL",
        type: "string"
    }, {
        name: "JK",
        type: "string"
    }, {
        name: "WILAYAH",
        type: "string"
    }, {
        name: "POLI",
        type: "int"
    }, {
        name: "DOKTER",
        type: "string"
    }, {
        name: "CARABAYAR",
        type: "string"
    }, {
        name: "CONTACT",
        type: "string"
    }, {
        name: "NO",
        type: "int"
    }, {
        name: "JAM",
        type: "string"
    }, {
        name: "POS_ANTRIAN",
        type: "string"
    }, {
        name: "NO_REF_BPJS",
        type: "string"
    }, {
        name: "POLI_BPJS",
        type: "string"
    }, {
        name: "REF_POLI_RUJUKAN",
        type: "string"
    }, {
        name: "JENIS",
        type: "int"
    }, {
        name: "STATUS",
        type: "int",
        defaultValue: 1
    }, {
        name: "JENIS_APLIKASI",
        type: "int"
    }],
    idProperty: "ID"
});
Ext.define("antrian.reservasi.Store", {
    extend: "data.store.Store",
    model: "antrian.reservasi.Model",
    alias: "store.antrian-reservasi-store"
});
Ext.define("antrian.responantrian.Model", {
    extend: "data.model.Model",
    serviceName: "registrasionline/plugins/responAntrian",
    fields: []
});
Ext.define("antrian.ruangan.Model", {
    extend: "data.model.Model",
    serviceName: "registrasionline/ruangan",
    fields: [{
        name: "ID",
        type: "int"
    }, {
        name: "DESKRIPSI",
        type: "string"
    }, {
        name: "ANTRIAN",
        type: "string"
    }, {
        name: "STATUS",
        type: "int",
        defaultValue: 1
    }, {
        name: "LIMIT_DAFTAR",
        type: "int",
        defaultValue: 100
    }, {
        name: "DURASI_PENDAFTARAN",
        type: "int"
    }, {
        name: "DURASI_PELAYANAN",
        type: "int"
    }, {
        name: "MULAI",
        type: "date",
        dateFormat: "H:i:s"
    }, {
        name: "JUMLAH_MEJA",
        type: "int"
    }, {
        name: "PERSENTASE_KOUTA",
        type: "int",
        defaultValue: 80
    }, {
        name: "PERSENTASE_KOUTA_NON_JKN",
        type: "int",
        defaultValue: 20
    }],
    idProperty: "ID"
});
Ext.define("antrian.ruangan.Store", {
    extend: "data.store.Store",
    model: "antrian.ruangan.Model",
    alias: "store.antrian-ruangan-store"
});
Ext.define("antrian.useraksespos.Model", {
    extend: "data.model.Model",
    serviceName: "registrasionline/useraksesposantrian",
    fields: [{
        name: "ID",
        type: "int"
    }, {
        name: "USER",
        type: "int"
    }, {
        name: "POS_ANTRIAN",
        type: "string"
    }, {
        name: "STATUS",
        type: "int",
        defaultValue: 1
    }],
    idProperty: "ID"
});
Ext.define("antrian.useraksespos.Store", {
    extend: "data.store.Store",
    model: "antrian.useraksespos.Model",
    alias: "store.useraksespos-antrian-store"
});
Ext.define("antrian.waktutungguantrian.Model", {
    extend: "data.model.Model",
    serviceName: "registrasionline/waktutungguantrian",
    fields: [{
        name: "ID",
        type: "int"
    }, {
        name: "TASK_ID",
        type: "int"
    }, {
        name: "TANGGAL",
        type: "date",
        dateFormat: "Y-m-d H:i:s"
    }, {
        name: "ANTRIAN",
        type: "string"
    }],
    idProperty: "ID"
});
Ext.define("antrian.waktutungguantrian.Store", {
    extend: "data.store.Store",
    model: "antrian.waktutungguantrian.Model",
    alias: "store.waktu-tunggu-antrian-store"
});
Ext.define("antrian.waktutungguantrian.batal.Model", {
    extend: "data.model.Model",
    serviceName: "registrasionline/plugins/batalkanAntrian",
    fields: []
});
Ext.define("antrian.waktutungguantrian.manual.Model", {
    extend: "data.model.Model",
    serviceName: "registrasionline/plugins/kirimWaktuTunggu",
    fields: []
});
Ext.define("antrian.waktutungguantrian.plugins.Model", {
    extend: "data.model.Model",
    serviceName: "registrasionline/plugins/updateTaskId",
    fields: []
});
Ext.define("antrian.waktutungguantrian.rsonline.Model", {
    extend: "data.model.Model",
    serviceName: "registrasionline/rsonline/kirimWaktuTunggu",
    fields: []
});
Ext.define("antrian.waktutungguantrian.rsonline.batal.Model", {
    extend: "data.model.Model",
    serviceName: "registrasionline/rsonline/batalAntrian",
    fields: []
});
Ext.define("antrian.waktutungguantrian.update.Model", {
    extend: "data.model.Model",
    serviceName: "registrasionline/bpjs/updateWaktuTunggu",
    fields: []
});
Ext.define("antrian.waktutungguantrian.update.Store", {
    extend: "data.store.Store",
    model: "antrian.waktutungguantrian.update.Model",
    alias: "store.waktu-tunggu-antrian-update-store"
});
Ext.define("antrian.Audio", {
    extend: "com.Form",
    xtype: "antrian-audio",
    audios: [],
    idx: 0,
    parent: undefined,
    audioCount: 10,
    constructor: function (a) {
        var f = this;
        f.config = Ext.apply(f.config, a);
        f.callParent();
        f.initConfig(f.config);
        var d = 0;
        if (a.parent.viewModel.data.posAntrian == "E") {
            f.audioCount = 9
        } else {
            if (a.parent.viewModel.data.posAntrian == "POLIK") {
                f.audioCount = 8
            } else {
                f.audioCount = 10
            }
        }
        for (var b = 0; b <= f.audioCount - 1; b++) {
            var e = Ext.create("com.Audio", {
                controls: false,
                volume: 10
            });
            e.on("ended", function () {
                if (f.idx < (f.audios.length - 1)) {
                    f.idx++;
                    f.audios[f.idx].play()
                } else {
                    f.idx = 0;
                    f.config.parent.onAKhir()
                }
            });
            f.audios.push(e)
        }
    },
    getAudios: function () {
        return this.audios
    },
    speechAntrian: function (a) {
        var e = this,
            d = location.origin + location.pathname,
            b = d + "resources/ringtone/";
        if (Ext.isArray(a)) {
            Ext.Array.each(a, function (f, g) {
                if (g == 0) {
                    e.audios[g].setSrc(b + f)
                } else {
                    e.audios[g].setSrc(b + f);
                    e.audios[g].load()
                }
            })
        } else {
            e.audios[e.idx].setSrc(b + a)
        }
        e.audios[e.idx].play();
        e.audios[e.idx].on("ended", function () {
            return 1
        })
    },
    load: function (a) {
        var d = this;
        if (Ext.isArray(a)) {
            var b = Ext.JSON.encode(a);
            d.request("tts?q=" + b + "&ty=json")
        } else {
            d.request("tts?q=" + a + "&ty=json")
        }
    },
    replay: function () {
        this.audios[this.idx].play()
    },
    destroy: function () {
        var d = this;
        if (d.audios.length > 0) {
            for (var a = 0; a <= d.audioCount - 1; a++) {
                var b = d.audios.pop();
                if (b) {
                    if (b.destroy) {
                        b.destroy()
                    }
                }
            }
            d.audios = []
        }
        d.callParent()
    }
});
Ext.define("antrian.registrasi.ComboCaraBayar", {
    extend: "com.Combo",
    alias: "widget.antrian-combo-carabayar",
    viewModel: {
        stores: {
            store: {
                type: "antrian-carabayar-store"
            }
        }
    },
    bind: {
        store: "{store}"
    },
    emptyText: "[ Cara Bayar ]",
    queryMode: "local",
    displayField: "DESKRIPSI",
    valueField: "ID",
    allowBlank: false,
    typeAhead: true,
    forceSelection: true,
    validateOnBlur: true
});
Ext.define("antrian.registrasi.ComboJadwalDokter", {
    extend: "com.Combo",
    alias: "widget.antrian-combo-jadwal-dokter",
    viewModel: {
        stores: {
            store: {
                type: "antrian-hfis-jadwaldokter-store"
            }
        }
    },
    bind: {
        store: "{store}"
    },
    emptyText: "[ Dokter ]",
    queryMode: "local",
    displayField: "NM_DOKTER",
    valueField: "KD_DOKTER",
    typeAhead: true,
    minChars: 2,
    tpl: Ext.create("Ext.XTemplate", '<tpl for=".">', '<div class="x-boundlist-item">', "[ {NM_DOKTER} ] - <strong>Pukul: {JAM}</strong>", "</div>", "</tpl>"),
    displayTpl: Ext.create("Ext.XTemplate", '<tpl for=".">', "{NM_DOKTER} - {JAM}", "</tpl>")
});
Ext.define("antrian.registrasi.ComboJenis", {
    extend: "com.Combo",
    alias: "widget.antrian-combo-jenis",
    viewModel: {
        stores: {
            store: {
                type: "antrian-jenispasien-store"
            }
        }
    },
    bind: {
        store: "{store}"
    },
    emptyText: "[ Jenis Pasien ]",
    queryMode: "local",
    displayField: "DESKRIPSI",
    valueField: "ID",
    allowBlank: false,
    typeAhead: true,
    forceSelection: true,
    validateOnBlur: true
});
Ext.define("antrian.ComboLoket", {
    extend: "com.Combo",
    alias: "widget.antrian-combo-loket",
    viewModel: {
        stores: {
            store: {
                type: "antrian-loket-store"
            }
        }
    },
    bind: {
        store: "{store}"
    },
    emptyText: "[ Loket Antrian ]",
    queryMode: "local",
    displayField: "DESKRIPSI",
    valueField: "ID",
    allowBlank: false,
    typeAhead: true,
    forceSelection: true,
    validateOnBlur: true
});
Ext.define("antrian.ComboPoli", {
    extend: "com.Combo",
    alias: "widget.antrian-combo-poli",
    viewModel: {
        stores: {
            store: {
                type: "antrian-ruangan-store"
            }
        }
    },
    bind: {
        store: "{store}"
    },
    emptyText: "[ Poli Tujuan ]",
    queryMode: "remote",
    displayField: "DESKRIPSI",
    queryParam: "QUERY",
    valueField: "ID",
    allowBlank: false,
    typeAhead: true,
    minChars: 2,
    forceSelection: true,
    validateOnBlur: true
});
Ext.define("antrian.registrasi.ComboPoliBpjs", {
    extend: "com.Combo",
    alias: "widget.antrian-combo-poli-bpjs",
    viewModel: {
        stores: {
            store: {
                type: "antrian-polibpjs-store"
            }
        }
    },
    bind: {
        store: "{store}"
    },
    emptyText: "[ Poliklinik ]",
    queryMode: "remote",
    hideTrigger: true,
    queryParam: "QUERY",
    displayField: "NMPOLI",
    valueField: "KDPOLI",
    typeAhead: true,
    minChars: 2,
    tpl: Ext.create("Ext.XTemplate", '<tpl for=".">', '<div class="x-boundlist-item">', "[ {KDPOLI} ] - <strong>{NMPOLI}</strong>", "</div>", "</tpl>"),
    displayTpl: Ext.create("Ext.XTemplate", '<tpl for=".">', "{KDPOLI} - {NMPOLI}", "</tpl>")
});
Ext.define("antrian.ComboPosAntrian", {
    extend: "com.Combo",
    alias: "widget.antrian-combo-pos-antrian",
    viewModel: {
        stores: {
            store: {
                type: "antrian-posantrian-store"
            }
        }
    },
    bind: {
        store: "{store}"
    },
    emptyText: "[ Pilih Pos Antrian ]",
    queryMode: "local",
    displayField: "DESKRIPSI",
    valueField: "NOMOR",
    typeAhead: true,
    forceSelection: true,
    validateOnBlur: true
});
Ext.define("antrian.registrasi.Form.Baru", {
    extend: "com.Form",
    xtype: "antrian-form-baru",
    requires: ["Ext.picker.Time"],
    layout: {
        type: "vbox",
        align: "stretch"
    },
    border: false,
    bodyPadding: 0,
    defaults: {
        margin: "0 0 10 0"
    },
    items: [{
        xtype: "hiddenfield",
        name: "JENIS",
        value: 2
    }, {
        xtype: "textfield",
        emptyText: "[ Nama Pasien ]",
        name: "NAMA"
    }, {
        xtype: "textfield",
        emptyText: "[ Tempat Lahir ]",
        name: "TEMPAT_LAHIR"
    }, {
        xtype: "datefield",
        emptyText: "[ Tanggal Lahir ]",
        format: "Y-m-d",
        name: "TANGGAL_LAHIR"
    }, {
        xtype: "textfield",
        emptyText: "[ Telepon / Kontak ]",
        name: "CONTACT"
    }]
});
Ext.define("antrian.registrasi.Form.Form", {
    extend: "com.Form",
    xtype: "antrian-form-form",
    requires: ["Ext.picker.Time"],
    viewModel: {
        data: {
            isPasienLama: true,
            isPasienBaru: true
        }
    },
    controller: "antrian-form-form",
    layout: {
        type: "vbox",
        align: "stretch"
    },
    items: [{
        xtype: "antrian-combo-jenis",
        name: "JENIS",
        firstLoad: true,
        allowBlank: false,
        listeners: {
            change: "onChange"
        }
    }, {
        xtype: "antrian-form-baru",
        bind: {
            hidden: "{isPasienBaru}"
        }
    }, {
        xtype: "antrian-form-lama",
        bind: {
            hidden: "{isPasienLama}"
        }
    }],
    getJenis: function () {
        var d = this,
            f = d.down("[name=JENIS]").getValue(),
            a = d.down("antrian-form-baru").getValues(),
            b = d.down("antrian-form-lama").getValues(),
            e = [];
        e.push({
            JENIS: f,
            BARU: a,
            LAMA: b
        });
        return e
    }
});
Ext.define("antrian.registrasi.Form.FormController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-form-form",
    onChange: function (d, f, a, b) {
        var e = this;
        if (f != "") {
            if (f == 1) {
                e.getViewModel().set("isPasienLama", false);
                e.getViewModel().set("isPasienBaru", true)
            } else {
                e.getViewModel().set("isPasienLama", true);
                e.getViewModel().set("isPasienBaru", false)
            }
        }
    }
});
Ext.define("antrian.registrasi.Form.Lama", {
    extend: "com.Form",
    xtype: "antrian-form-lama",
    requires: ["Ext.picker.Time"],
    layout: {
        type: "vbox",
        align: "stretch"
    },
    border: false,
    bodyPadding: 0,
    defaults: {
        margin: "0 0 10 0"
    },
    initComponent: function () {
        var a = this;
        a.items = [{
            xtype: "textfield",
            emptyText: "[ No.RM ]",
            name: "NORM"
        }, {
            xtype: "datefield",
            emptyText: "[ Tanggal Lahir ]",
            name: "TANGGAL_LAHIR",
            format: "Y-m-d",
            maxValue: a.getSysdate()
        }];
        a.callParent(arguments)
    }
});
Ext.define("antrian.registrasi.Form.Workspace", {
    extend: "com.Form",
    xtype: "antrian-form-workspace",
    viewModel: {
        data: {
            kjgn: undefined
        }
    },
    layout: "border",
    bodyPadding: 1,
    items: [{
        region: "center",
        xtype: "antrian-form-form",
        border: false,
        scrollable: "y"
    }],
    getData: function () {
        var a = this.down("antrian-form-form").getJenis();
        return a
    }
});
Ext.define("antrian.registrasi.Register.Form", {
    extend: "com.Form",
    xtype: "antrian-register-form",
    model: "antrian.reservasi.Model",
    requires: ["Ext.picker.Time"],
    layout: {
        type: "vbox",
        align: "stretch"
    },
    defaults: {
        margin: "0 0 10 0"
    },
    initComponent: function () {
        var a = this;
        a.items = [{
            xtype: "textfield",
            emptyText: "[ No.Rekam Medis ]",
            name: "NORM",
            disabled: true
        }, {
            xtype: "textfield",
            emptyText: "[ Nama Pasien ]",
            name: "NAMA",
            disabled: true
        }, {
            xtype: "textfield",
            emptyText: "[ Tempat Lahir ]",
            name: "TEMPAT_LAHIR",
            disabled: true
        }, {
            xtype: "datefield",
            format: "Y-m-d",
            emptyText: "[ Tanggal Lahir ]",
            name: "TANGGAL_LAHIR",
            disabled: true
        }, {
            xtype: "textfield",
            emptyText: "[ Telepon / Kontak ]",
            name: "CONTACT",
            allowBlank: false
        }, {
            xtype: "antrian-combo-poli",
            emptyText: "[ Poli Tujuan ]",
            name: "POLI",
            firstLoad: true,
            allowBlank: false
        }, {
            xtype: "datefield",
            emptyText: "[ Tanggal Kunjungan ]",
            name: "TANGGALKUNJUGAN",
            format: "Y-m-d",
            minValue: a.getSysdate()
        }, {
            xtype: "antrian-combo-carabayar",
            emptyText: "[ Cara Bayar ]",
            name: "CARABAYAR",
            firstLoad: true,
            allowBlank: false
        }];
        a.callParent(arguments)
    }
});
Ext.define("antrian.registrasi.Register.Workspace", {
    extend: "com.Form",
    xtype: "antrian-register-workspace",
    viewModel: {
        data: {
            idnPsn: undefined
        }
    },
    layout: "border",
    bodyPadding: 1,
    items: [{
        region: "center",
        xtype: "antrian-register-form",
        border: false,
        scrollable: "y"
    }],
    onLoadRecord: function (d) {
        var b = this,
            a = b.down("antrian-register-form");
        a.createRecord(d);
        b.getViewModel().set("idnPsn", d)
    },
    getData: function () {
        var b = this,
            a = b.down("antrian-register-form"),
            d = a.getRecord();
        return d
    }
});
Ext.define("antrian.Sukses.Form", {
    extend: "com.Form",
    xtype: "antrian-sukses-form",
    viewModel: {
        data: {
            nomor: "00",
            namars: "RS.SIMpel",
            poliklinik: "-",
            tglkunjungan: "0000-00-00",
            jamkunjungan: "00:00"
        }
    },
    layout: {
        type: "hbox"
    },
    border: false,
    bodyPadding: 15,
    initComponent: function () {
        var a = this;
        a.items = [{
            layout: {
                type: "vbox",
                align: "center"
            },
            border: false,
            width: 150,
            defaultType: "component",
            items: [{
                html: "Nomor Antrian",
                margin: "0 0 15 0"
            }, {
                flex: 1,
                bind: {
                    html: "{nomor}"
                },
                margin: "0 0 5 0",
                style: "font-size:35px"
            }]
        }, {
            layout: {
                type: "vbox",
                align: "stretch"
            },
            border: false,
            defaultType: "component",
            items: [{
                bind: {
                    html: "Rumah Sakit Tujuan : {namars}",
                    margin: "0 0 5 0"
                }
            }, {
                bind: {
                    html: "Klinik : {poliklinik}",
                    margin: "0 0 5 0"
                }
            }, {
                bind: {
                    html: "Jadwal Kunjungan : {tglkunjungan} ,  Jam : {jamkunjungan}",
                    margin: "0 0 25 0"
                }
            }, {
                html: "<i><b>* Harap Membawa Bukti Transaksi Dan Surat Rujukan Beserta Kelengkapan Berkas Lainnya</b></i>",
                margin: "0 0 5 0",
                style: "font-size:9px"
            }]
        }];
        a.callParent(arguments)
    },
    onLoadRecord: function (d) {
        var a = this,
            b = Ext.Date.format(d.get("TANGGALKUNJUGAN"), "d M Y");
        a.getViewModel().set("nomor", d.get("NO"));
        a.getViewModel().set("namars", "RSIA. Nasanapura Palu");
        a.getViewModel().set("poliklinik", d.get("REFERENSI").POLI.DESKRIPSI);
        a.getViewModel().set("tglkunjungan", b);
        a.getViewModel().set("jamkunjungan", d.get("JAM"))
    },
    onCetak: function () {
        var a = this,
            b = "1803220001";
        a.cetak({
            NAME: "penjualan.CetakFakturPenjualan",
            TYPE: _type,
            EXT: _ext,
            PARAMETER: {
                PTAGIHAN: b,
                PJENIS: 4
            },
            REQUEST_FOR_PRINT: _print,
            PRINT_NAME: "CetakResep"
        }, function (d) {
            a.printPreview(_title, d)
        })
    }
});
Ext.define("antrian.Sukses.Workspace", {
    extend: "com.Form",
    xtype: "antrian-sukses-workspace",
    viewModel: {
        stores: {
            store: {
                type: "antrian-reservasi-store"
            }
        }
    },
    layout: "border",
    bodyPadding: 1,
    items: [{
        region: "center",
        type: "component",
        items: [{
            xtype: "antrian-sukses-form",
            border: false,
            scrollable: "x"
        }],
        scrollable: "y"
    }],
    onLoadRecord: function (d) {
        var b = this,
            a = b.getViewModel().get("store");
        if (a) {
            a.removeAll();
            a.queryParams = {
                NOMOR: d.NOMOR
            };
            a.load({
                callback: function (h, f, g) {
                    if (g) {
                        var e = b.down("antrian-sukses-form");
                        e.onLoadRecord(h[0])
                    }
                }
            })
        }
    },
    getData: function () {
        var b = this,
            a = b.getViewModel().get("store").getData().items[0];
        return a
    }
});
Ext.define("antrian.registrasi.Workspace", {
    extend: "com.Form",
    alias: "widget.antrian-workspace",
    controller: "antrian-workspace",
    viewModel: {
        stores: {
            store: {
                type: "antrian-pasien-store"
            }
        },
        data: {
            card1: false,
            card2: false,
            card3: false
        }
    },
    xtype: "layout-card",
    layout: "card",
    border: false,
    plugins: "responsive",
    width: 129,
    responsiveConfig: {
        "width < 600": {
            style: "height:200px;margin-left:auto;margin-right:auto;padding:20px;background:#24928f"
        },
        "width >= 600": {
            style: "height:200px;margin-left:150px;margin-right:150px; margin-top:10px;margin-bottom:10px;border-radius:1px;box-shadow:white 1px 2px 3px 1px"
        }
    },
    tbar: {
        reference: "progress",
        defaultButtonUI: "wizard-soft-purple",
        cls: "wizardprogressbar",
        defaults: {
            disabled: true,
            iconAlign: "top",
            plugins: "responsive"
        },
        layout: {
            pack: "center"
        },
        items: [{
            step: 0,
            iconCls: "fa fa-user",
            bind: {
                pressed: "{card1}"
            },
            enableToggle: true,
            text: "Verifikasi"
        }, {
            step: 1,
            bind: {
                pressed: "{card2}"
            },
            iconCls: "fa fa-home",
            enableToggle: true,
            text: "Tujuan Pasien"
        }, {
            step: 2,
            bind: {
                pressed: "{card3}"
            },
            iconCls: "fa fa-check-circle",
            enableToggle: true,
            text: "Selesai"
        }]
    },
    bbar: ["->", {
        itemId: "card-home",
        iconCls: "x-fa fa-home",
        text: "Home",
        xtype: "button",
        reference: "btnHome",
        hidden: true,
        handler: "doHome"
    }, {
        itemId: "card-prev",
        text: "&laquo; Previous",
        ui: "soft-blue",
        reference: "btnShowPrevious",
        handler: "showPrevious",
        disabled: true
    }, {
        itemId: "card-next",
        text: "Next &raquo;",
        ui: "soft-blue",
        reference: "btnShowNext",
        handler: "showNext"
    }, {
        itemId: "card-finish",
        text: "Simpan &raquo;",
        ui: "soft-green",
        iconCls: "x-fa fa-save",
        xtype: "button",
        reference: "btnSimpan",
        hidden: true,
        handler: "onSimpan"
    }, {
        itemId: "card-cetak",
        iconCls: "x-fa fa-print",
        text: "Cetak & Download",
        ui: "soft-blue",
        xtype: "button",
        reference: "btnCetak",
        hidden: true,
        handler: "onCetak"
    }],
    items: [{
        id: "card-0",
        xtype: "antrian-form-workspace",
        reference: "formidentitas",
        border: false
    }, {
        id: "card-1",
        xtype: "antrian-register-workspace",
        reference: "formregister",
        border: false
    }, {
        id: "card-2",
        xtype: "antrian-sukses-workspace",
        reference: "formsuksesregistrasi",
        border: false
    }],
    onLoadRecord: function (d) {
        var b = this,
            a = b.down("antrian-form-workspace");
        b.getViewModel().set("card1", true)
    },
    isCekIdentitas: function (d) {
        var b = this,
            a = b.getViewModel().get("store");
        if (d) {
            a.removeAll();
            a.queryParams = {
                NORM: d.NORM,
                TANGGAL_LAHIR: d.TANGGAL
            };
            a.load({
                callback: function (g, e, f) {
                    if (f) {
                        return g
                    }
                }
            })
        }
    }
});
Ext.define("antrian.registrasi.WorkspaceController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-workspace",
    onTabChange: function (d, a) {
        var b = this.getView().rec;
        if (a.load) {
            a.onLoadRecord({})
        }
    },
    showNext: function (b) {
        var e = this,
            d = e.getView().getLayout().getActiveItem(),
            a = e.getView().getViewModel().get("store"),
            f = d.getData();
        if (f[0].JENIS) {
            if (f[0].JENIS == 1) {
                if (f[0].LAMA.NORM) {
                    if (f[0].LAMA.TANGGAL_LAHIR) {
                        var g = e.getView().isCekIdentitas({
                            NORM: f[0].LAMA.NORM,
                            TANGGAL: f[0].LAMA.TANGGAL_LAHIR
                        });
                        a.doAfterLoad = function (h) {
                            c = [];
                            h.each(function (j) {
                                c.push({
                                    JENIS: 1,
                                    NORM: j.get("NORM"),
                                    NAMA: j.get("NAMA"),
                                    TEMPAT_LAHIR: j.get("TEMPAT_LAHIR"),
                                    TANGGAL_LAHIR: j.get("TANGGAL_LAHIR"),
                                    STATUS: true
                                })
                            });
                            if (c.length > 0) {
                                e.getView().notifyMessage("Data Ditemukan");
                                e.doCardNavigation(1);
                                e.getView().getLayout().getActiveItem().onLoadRecord(c[0])
                            } else {
                                e.getView().notifyMessage("Data Tidak Ditemukan")
                            }
                        }
                    } else {
                        e.getView().notifyMessage("Isi Tanggal Lahir Terlebih Dahulu")
                    }
                } else {
                    e.getView().notifyMessage("Isi No.RM Terlebih Dahulu")
                }
            } else {
                e.doCardNavigation(1);
                e.getView().getLayout().getActiveItem().onLoadRecord(f[0].BARU)
            }
        }
    },
    showPrevious: function (a) {
        this.doCardNavigation(-1)
    },
    doCardNavigation: function (g) {
        var f = this,
            e = f.getReferences(),
            a = f.getView().getLayout(),
            b = a.activeItem.id.split("card-")[1],
            d = parseInt(b, 10) + g;
        a.setActiveItem(d);
        e.btnShowPrevious.setDisabled(d === 0);
        e.btnShowNext.setHidden(d === 1);
        e.btnSimpan.setHidden(d === 0);
        e.btnCetak.setHidden(true);
        e.btnHome.setHidden(true);
        f.onSetAktifbar(d)
    },
    onSetAktifbar: function (d) {
        var b = this,
            a = b.getViewModel();
        if (d == 1) {
            a.set("card1", false);
            a.set("card2", true);
            a.set("card3", false)
        } else {
            if (d == 2) {
                a.set("card1", false);
                a.set("card2", false);
                a.set("card3", true)
            } else {
                a.set("card1", true);
                a.set("card2", false);
                a.set("card3", false)
            }
        }
    },
    onSimpan: function (a) {
        var d = this,
            b = d.getView().getLayout().getActiveItem(),
            e = b.getData();
        if (e) {
            e.set("STATUS", 1);
            e.save({
                callback: function (j, f, g) {
                    var h = Ext.JSON.decode(f._response.responseText);
                    if (h.status) {
                        d.getView().notifyMessage("Sukses");
                        d.doCetakBukti(h)
                    } else {
                        d.getView().notifyMessage(h.PESAN);
                        d.showPrevious()
                    }
                }
            })
        }
    },
    doCetakBukti: function (g) {
        var f = this,
            e = f.getReferences(),
            a = f.getView().getLayout(),
            b = a.activeItem.id.split("card-")[1],
            d = parseInt(b, 10) + 1;
        a.setActiveItem(d);
        e.btnShowPrevious.setHidden(true);
        e.btnShowNext.setHidden(true);
        e.btnSimpan.setHidden(true);
        e.btnCetak.setHidden(false);
        e.btnHome.setHidden(false);
        f.getView().getLayout().getActiveItem().onLoadRecord(g);
        f.onSetAktifbar(2)
    },
    doHome: function (e) {
        var d = this,
            b = d.getReferences(),
            a = d.getView().getLayout();
        a.setActiveItem(0);
        b.btnShowPrevious.setHidden(false);
        b.btnShowPrevious.setDisabled(true);
        b.btnShowNext.setHidden(false);
        b.btnSimpan.setHidden(true);
        b.btnCetak.setHidden(true);
        b.btnHome.setHidden(true);
        d.onSetAktifbar(0)
    },
    onCetak: function (a) {
        var d = this,
            b = d.getView().getLayout().getActiveItem(),
            e = b.getData();
        var f = {
            NAME: "plugins.antrian.online.CetakBuktiRegistrasiOnline",
            TYPE: "Word",
            EXT: "doc",
            PARAMETER: {
                DOWNLOAD: true,
                PNOMOR: e.get("ID")
            },
            REQUEST_FOR_PRINT: false,
            PRINT_NAME: "CetakRL"
        };
        paramstring = JSON.stringify(f);
        json = Ext.JSON.decode(paramstring);
        f.PARAMETER.PNOMOR = e.get("ID");
        json = Ext.apply(json, f);
        this.getView().fireEvent("requestreport", "Bukti Registrasi", json, true)
    }
});
Ext.define("antrian.chat.Form", {
    extend: "com.Form",
    alias: "widget.antrian-chat-form",
    controller: "antrian-chat-form",
    viewModel: {
        data: {
            isResep: false
        }
    },
    layout: {
        type: "vbox",
        align: "stretch"
    },
    ui: "panel-cyan",
    border: true,
    header: {
        iconCls: "x-fa fa-file",
        padding: "7px 7px 7px 7px",
        title: "Chat"
    },
    fieldDefaults: {
        labelAlign: "top"
    },
    items: [{
        xtype: "container",
        margin: "0 0 10 0",
        layout: {
            type: "hbox",
            align: "stretch"
        },
        items: [{
            name: "LOKET",
            reference: "loket",
            xtype: "textfield",
            margin: "0 5 0 0",
            emptyText: "[ Loket ]",
            flex: 1
        }, {
            name: "PESAN",
            reference: "pesan",
            xtype: "textfield",
            margin: "0 5 0 0",
            emptyText: "[ Pesan ]",
            flex: 1
        }, {
            xtype: "button",
            iconCls: "x-fa fa-save",
            reference: "btnaddbarang",
            text: "Kirim",
            ui: "soft-green",
            handler: "onKirim"
        }]
    }, {
        name: "KETERANGAN",
        reference: "keterangan",
        xtype: "textarea",
        emptyText: "[ Keterangan ]",
        flex: 1
    }],
    onLoadRecord: function () {
        var a = this;
        a.onOpenConnection("display1")
    },
    onOpenConnection: function (b) {
        var a = Ext.create("Ext.ux.WebSocket", {
            url: "ws://" + window.location.hostname + ":8899",
            listeners: {
                open: function (d) {
                    console.log(d)
                },
                message: function (d, f) {
                    var e = JSON.parse(f);
                    console.log(e)
                },
                close: function (d) {
                    console.log("Close : " + d)
                }
            }
        })
    }
});
Ext.define("antrian.chat.FormController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-chat-form",
    onKirim: function () {
        var b = this,
            a = b.getReferences();
        console.log(a.pesan.getValue())
    }
});
Ext.define("antrian.chat.Workspace", {
    extend: "com.Form",
    alias: "widget.antrian-chat-workspace",
    layout: {
        type: "hbox",
        align: "stretch"
    },
    items: [{
        flex: 1,
        xtype: "antrian-chat-form",
        reference: "penjualanpengunjung"
    }],
    onLoadRecord: function () {
        var b = this,
            a = b.down("antrian-chat-form");
        a.focus("PESAN");
        a.onLoadRecord()
    }
});
Ext.define("antrian.display.List", {
    extend: "com.Form",
    xtype: "antrian-display-list",
    controller: "antrian-display-list",
    viewModel: {
        data: {
            formConfig: {
                disabledField: true
            }
        }
    },
    layout: {
        type: "vbox",
        align: "stretch"
    },
    flex: 1,
    border: true,
    posantrians: undefined,
    initComponent: function () {
        var a = this;
        a.items = [{
            xtype: "antrian-monitoring-posantrian-list",
            reference: "posantrianlist",
            ui: "panel-cyan",
            hideHeaders: true,
            posAntrianAkses: false,
            checkboxModel: true,
            flex: 1,
            selModel: {
                selType: "checkboxmodel",
                checkOnly: true
            }
        }, {
            xtype: "toolbar",
            ui: "toolbar-blue",
            items: ["->", {
                fieldLabel: "Tanggal Kunjungan",
                labelWidth: 180,
                name: "TANGGAL",
                reference: "tglkumjungan",
                width: 350,
                xtype: "datefield",
                margin: "0px 50px 0px 0px",
                emptyText: "[Pilih Tanggal Kunjungan]",
                format: "Y-m-d",
                bind: {
                    minValue: "{minDate}"
                },
                value: a.getSysdate(),
                maxValue: a.getSysdate(),
                allowBlank: false
            }, {
                xtype: "antrian-combo-loket",
                value: 4,
                fieldLabel: "Jumlah Loket",
                name: "LOKET",
                margin: "0px 50px 0px 0px",
                firstLoad: true,
                reference: "jumlahloket"
            }, {
                xtype: "combobox",
                reference: "jumlahkolom",
                fieldLabel: "Jumlah Kolom",
                value: 2,
                store: {
                    data: [{
                        ID: 1
                    }, {
                        ID: 2
                    }, {
                        ID: 3
                    }, {
                        ID: 4
                    }, {
                        ID: 5
                    }]
                },
                displayField: "ID",
                valueField: "ID"
            }, {
                text: "Mulai",
                listeners: {
                    click: "onMulai"
                }
            }]
        }];
        a.callParent(arguments)
    },
    onLoadRecord: function (e) {
        var d = this,
            a = d.down("antrian-monitoring-posantrian-list"),
            b = d.down("[reference=jumlahloket]");
        a.setParams({
            STATUS: 1
        });
        b.on("select", function (f, g) {
            d.jumlahloket = g.get("ID")
        });
        a.loadStore()
    }
});
Ext.define("antrian.display.ListController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-display-list",
    onClickRespon: function (d, g, b) {
        var e = this,
            a = e.getView(),
            f = d.getStore().getAt(g);
        if (f.get("STATUS") == 1) {
            e.onResponPasien(f)
        } else {
            a.notifyMessage("Data Sudah Di Respon")
        }
    },
    onMulai: function (l) {
        var f = this,
            h = f.getView(),
            g = f.getReferences(),
            k = [],
            e = g.posantrianlist,
            b = g.jumlahloket.getSelection().get("ID"),
            j = g.jumlahkolom.getSelection().get("ID"),
            d = g.tglkumjungan.getValue(),
            a = e.getSelection();
        Ext.Array.each(a, function (m) {
            k.push(m)
        });
        if (k.length == 0) {
            h.notifyMessage("Silahkan Pilih Salah Satu Pos Antrian Yang Ingin Ditampilkan");
            return
        }
        if (k.length > 1) {
            h.notifyMessage("Maksimal 1 Pos Antrian Yang Dapat Ditampilkan");
            return
        }
        dialog = h.openDialog("", true, 0, 0, {
            xtype: "antrian-display-workspace",
            title: "Informasi Antrian Online",
            ui: "panel-cyan",
            showCloseButton: true,
            hideColumns: true
        }, function (n, o) {
            var m = o.down("antrian-display-workspace");
            m.onLoadRecord(k, b, d, j)
        })
    }
});
Ext.define("antrian.display.View", {
    extend: "Ext.view.View",
    xtype: "antrian-display-view",
    viewModel: {
        stores: {
            store: {
                type: "antrian-panggilantrian-store"
            }
        },
        data: {
            jmlKolom: 2
        }
    },
    layout: {
        type: "vbox",
        align: "stretch"
    },
    loadMask: false,
    autoScroll: true,
    cls: "laporan-main laporan-dataview",
    bind: {
        store: "{store}"
    },
    jmlKolom: 1,
    itemSelector: "div.thumb-wrap",
    tpl: Ext.create("Ext.XTemplate", '<tpl for=".">', '<div class="thumb-wrap big-33 small-50" style="text-align:center;width:{KOLOM}%;display:grid;padding:15px;">', '<a class="thumb" href="#" style="background:#E9967A">', '<div class="thumb-title-container" style="float:left;width:50%">', '<div class="thumb-title"><p style="font-size:22px;color:green">LOKET</p></div>', '<div class="thumb-title">', '<p style="font-size:74px;color:green">{LOKET} </p>', "</div>", "</div>", '<div class="thumb-title-container" style="float:right;width:50%;border-left:2px #DDD solid">', '<div class="thumb-title"><p style="font-size:22px;">ANTRIAN</p></div>', '<div class="thumb-title">', '<p style="font-size:64px;"><u>{POS}{CARA_BAYAR}</u></p><p style="font-size:64px;">{[this.formatNomor(values.NOMOR)]}</p>', "</div>", "</div>", '<div class="thumb-title-container" style="float:left;width:100%;border-top:2px #DDD solid">', '<div class="thumb-title"><p style="font-size:22px;color:{[this.formatColorStatus(values.STATUS)]}">{[this.formatStatus(values.STATUS)]}</p></div>', "</div>", "</a>", "</div>", "</tpl>", {
        formatNomor: function (a) {
            var b = Ext.String.leftPad(a, 3, "0");
            return b
        },
        formatStatus: function (a) {
            if (a == 1) {
                return "Buka"
            }
            return "Tutup"
        },
        formatColorStatus: function (a) {
            if (a == 1) {
                return "green"
            }
            return "#DDD"
        }
    }),
    onLoadRecord: function (a) {
        var e = this,
            d = e.getViewModel().get("store");
        e.getViewModel().set("jmlKolom", a.KOLOM);
        if (d) {
            if (a.POS == "K") {
                var f = a.LIMIT;
                d.setQueryParams({
                    POS: a.POS,
                    TANGGAL: a.TANGGAL,
                    STATUS: 1,
                    KOLOM: a.KOLOM,
                    start: 0,
                    limit: f
                })
            } else {
                var f = a.LIMIT;
                d.setQueryParams({
                    POS: a.POS,
                    TANGGAL: a.TANGGAL,
                    KOLOM: a.KOLOM,
                    start: 0,
                    limit: f
                })
            }
            d.load()
        }
    },
    getStore: function () {
        return this.getViewModel().get("store")
    },
    reload: function () {
        var b = this.getViewModel().get("store");
        if (b) {
            b.reload()
        }
    }
});
Ext.define("antrian.display.Workspace", {
    extend: "com.Form",
    xtype: "antrian-display-workspace",
    controller: "antrian-display-workspace",
    viewModel: {
        data: {
            ruangans: [],
            refreshTime: 0,
            instansi: undefined,
            infoTeks: "",
            infoKelasKamar: "",
            tglNow: "-",
            statusWebsocket: "Disconnect",
            suaraIn: "",
            panggilsuara: "",
            suaraOut: "",
            suaraNo1: "",
            suaraNo2: "",
            suaraNo3: "",
            posAntrian: ""
        },
        stores: {
            store: {
                type: "instansi-store"
            }
        }
    },
    audio: {
        integrasi: undefined,
        service: undefined
    },
    layout: {
        type: "vbox",
        align: "stretch"
    },
    defaults: {
        border: false
    },
    datapanggil: [],
    dataAntrian: [],
    audioCount: 1,
    audios: [],
    idx: 0,
    bodyStyle: "background-color:#aa8a51",
    initComponent: function () {
        if (window.location.protocol == "http:") {
            var d = "ws"
        } else {
            var d = "wss"
        }
        var b = this;
        var a = Ext.create("Ext.ux.WebSocket", {
            url: "ws://" + window.location.hostname + ":8899",
            listeners: {
                open: function (e) {
                    b.getViewModel().set("statusWebsocket", "Connected")
                },
                message: function (e, h) {
                    var f = JSON.parse(h);
                    if (f) {
                        if (f.act) {
                            if (f.act == "PANGGIL") {
                                if (b.getViewModel().get("posAntrian") == f.pos) {
                                    var g = f.pos + "" + f.carabayar + "" + f.nomor + "" + f.loket;
                                    if (!b.dataAntrian.includes(g)) {
                                        b.datapanggil.push(f);
                                        b.dataAntrian.push(g)
                                    }
                                    if (b.datapanggil.length === 1) {
                                        b.setProsesPanggil();
                                        b.onRefreshView(f.pos)
                                    }
                                }
                            }
                            if (f.act == "REFRESH_LOKET") {
                                if (b.getViewModel().get("posAntrian") == f.pos) {
                                    b.onRefreshView(f.pos)
                                }
                            }
                        }
                    }
                },
                close: function (e) {
                    b.getViewModel().set("statusWebsocket", "Disonnected Socket")
                }
            }
        });
        b.items = [{
            layout: {
                type: "hbox",
                align: "middle"
            },
            border: false,
            height: 50,
            bodyStyle: "padding-left:10px;background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,#356aa0), color-stop(100%,#356aa0));",
            items: [{
                xtype: "image",
                bind: {
                    src: "classic/resources/images/{instansi}.png"
                },
                id: "idImage",
                width: 40,
                border: false,
                bodyStyle: "background-color:transparent;"
            }, {
                flex: 1,
                bind: {
                    data: {
                        items: "{store.data.items}"
                    }
                },
                tpl: new Ext.XTemplate('<tpl for="items">', "{data.REFERENSI.PPK.NAMA}", "</tpl>"),
                border: false,
                bodyStyle: "background-color:transparent; font-size: 18px; color: white; "
            }, {
                xtype: "label",
                bind: {
                    html: "{tglNow}"
                },
                width: 350,
                border: false,
                style: "background-color:transparent; font-size: 20px; color: white; "
            }]
        }, {
            flex: 1,
            layout: {
                type: "hbox",
                align: "stretch"
            },
            defaults: {
                flex: 1,
                margin: "0 1 0 1"
            },
            border: false,
            reference: "informasi",
            items: [{
                flex: 2,
                border: false,
                layout: {
                    type: "vbox",
                    align: "stretch"
                },
                defaults: {
                    bodyStyle: "background-color:#D8F1EC"
                },
                items: [{
                    border: true,
                    style: "padding:15px;background-color:#A5C8D1;border-bottom:1px #DDD solid",
                    bodyStyle: "background-color:transparent",
                    html: '<iframe width="100%" height="300px" src="classic/resources/images/banner-antrian/video.mp4" frameborder="0" allow="accelerometer loop="true" autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
                }, {
                    xtype: "image",
                    src: "classic/resources/images/banner-antrian/image.jpg",
                    style: "width:100%;height:300px;padding:15px;background-color:#A5C8D1;border-bottom:1px #DDD solid",
                    border: true,
                    bodyStyle: "background-color:transparent;"
                }, {
                    xtype: "container",
                    style: "background-color:#A5C8D1;",
                    flex: 1
                }, {
                    style: "padding:10px;font-size:14px;border-top:1px #DDD solid;text-left:center;font-style:italic;color:#434343;background-color:#A5C8D1;",
                    bodyStyle: "background-color:transparent",
                    bind: {
                        html: "Status : {statusWebsocket}"
                    }
                }]
            }, {
                flex: 5,
                border: false,
                layout: {
                    type: "vbox",
                    align: "stretch"
                },
                bodyPadding: "20",
                items: [{
                    xtype: "component",
                    html: "NOMOR ANTRIAN YANG DI LAYANI",
                    style: "padding:15px;font-size:22px;text-align:center;color:#434343;background-color:#A5C8D1;border-radius:4px;margin-top:20px"
                }, {
                    flex: 1,
                    reference: "dataview",
                    style: "margin-top:10px;background-color:#FFF",
                    xtype: "antrian-display-view",
                    viewConfig: {
                        loadMask: false
                    }
                }]
            }]
        }, {
            layout: {
                type: "hbox",
                align: "middle"
            },
            height: 30,
            border: false,
            bodyStyle: "background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,#356aa0), color-stop(100%,#356aa0));",
            items: [{
                xtype: "displayfield",
                flex: 1,
                fieldStyle: "background-color:transparent;font-size: 14px;  margin-left: 10px;color: white;",
                border: false,
                bind: {
                    value: "<marquee>{infoTeks}</marquee>"
                }
            }]
        }];
        b.callParent(arguments)
    },
    onLoadRecord: function (b, g, d, h) {
        var e = this,
            f = e.down("antrian-display-view"),
            a = e.getController();
        a.mulai();
        if (b) {
            f.onLoadRecord({
                POS: b[0].get("NOMOR"),
                LIMIT: g,
                TANGGAL: Ext.Date.format(d, "Y-m-d"),
                KOLOM: h
            });
            e.getViewModel().set("posAntrian", b[0].get("NOMOR"))
        }
        e.audio.service = Ext.create("antrian.Audio", {
            parent: e,
            audioCount: 10,
            posAntrian: e.getViewModel().get("posAntrian")
        });
        e.audios = e.audio.service.getAudios();
        if (e.audio.service) {
            e.add(e.audios)
        }
    },
    onAKhir: function (a) {
        var b = this,
            d = b.getViewModel().get("posAntrian");
        b.dataAntrian.shift();
        b.datapanggil.shift();
        b.setProsesPanggil();
        b.onRefreshView(d)
    },
    getPosAntrian: function () {
        var a = this,
            b = a.getViewModel().get("posAntrian");
        return b
    },
    onRefreshView: function (e) {
        var d = this,
            a = d.down("antrian-display-view").getStore(),
            b = a.getQueryParams().POS;
        if (b == e) {
            a.reload()
        }
    },
    runLogo: function () {
        if (this.deg == 360) {
            this.deg = 0
        } else {
            this.deg += 5
        }
        Ext.getCmp("idImage").setStyle("-webkit-transform: rotateY(" + this.deg + "deg)")
    },
    remove: function (d, b) {
        var a = Ext.Array.indexOf(d, b);
        if (a !== -1) {
            erase(d, a, 1)
        }
        return d
    },
    setProsesPanggil: function () {
        var b = this;
        if (b.datapanggil.length > 0) {
            var e = Ext.String.leftPad(b.datapanggil[0].nomor, 3, "0"),
                d = e.split("", 3);
            var a = {
                POS: b.datapanggil[0].pos,
                CB: b.datapanggil[0].carabayar,
                LOKET: b.datapanggil[0].loket,
                NOMOR1: d[0],
                NOMOR2: d[1],
                NOMOR3: d[2]
            };
            b.callAntrian(a)
        }
    },
    privates: {
        callAntrian: function (d) {
            var b = this;
            if (d) {
                if (d.POS == "E") {
                    var a = b.audio.service.speechAntrian(["in.wav", "nomor_antrian.mp3", d.POS + ".mp3", d.CB + ".mp3", d.NOMOR1 + ".mp3", d.NOMOR2 + ".mp3", d.NOMOR3 + ".mp3", "silahkan_kelaboratorium.mp3", "out.wav"])
                } else {
                    var a = b.audio.service.speechAntrian(["in.wav", "nomor_antrian.mp3", d.POS + ".mp3", d.CB + ".mp3", d.NOMOR1 + ".mp3", d.NOMOR2 + ".mp3", d.NOMOR3 + ".mp3", "silahkan_ke_loket.mp3", d.LOKET + ".mp3", "out.wav"])
                }
            }
        }
    }
});
Ext.define("antrian.display.WorkspaceController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-display-workspace",
    currentRefreshTimeRuangan: 0,
    refreshTime: 0,
    load: function (d) {
        var b = this,
            a = b.getView();
        a.createWidgets(d);
        a.items.each(function (j, f, g) {
            try {
                j.onLoadRecord({
                    STATUS: 1
                })
            } catch (h) {}
        })
    },
    onAfterRender: function () {
        var e = this,
            b = e.getViewModel(),
            a = b.get("store"),
            d = Ext.getStore("instansi");
        if (d) {
            b.set("store", d);
            new Ext.util.DelayedTask(function () {
                b.set("instansi", d.getAt(0).get("PPK"))
            }).delay(1000)
        } else {
            a.doAfterLoad = function (f, h, g, j) {
                if (j) {
                    if (h.length > 0) {
                        b.set("instansi", h[0].get("PPK"))
                    }
                }
            };
            a.load()
        }
    },
    mulai: function (d) {
        var b = this,
            a = b.getViewModel();
        b.currentRefreshTimeRuangan = a.get("refreshTime");
        b.refreshTime = a.get("refreshTime");
        if (b.task == undefined) {
            b.task = {
                run: function () {
                    a.set("tglNow", Ext.Date.format(new Date(), "l, d F Y H:i:s"));
                    if (b.currentRefreshTimeRuangan == 0) {
                        b.currentRefreshTimeRuangan = b.refreshTime
                    }
                    b.currentRefreshTimeRuangan--;
                    a.set("refreshTime", b.currentRefreshTimeRuangan)
                },
                interval: 1000
            };
            Ext.TaskManager.start(b.task)
        }
    },
    destroy: function () {
        var a = this;
        Ext.TaskManager.stop(a.task);
        a.callParent()
    }
});
Ext.define("antrian.monitoring.List", {
    extend: "com.Grid",
    xtype: "antrian-monitoring-list",
    controller: "antrian-monitoring-list",
    penggunaAksesPos: [],
    viewModel: {
        stores: {
            store: {
                type: "antrian-reservasi-store"
            },
            storepemanggil: {
                type: "antrian-panggilantrian-store"
            }
        },
        data: {
            tgltemp: undefined,
            tglSkrng: undefined,
            statusWebsocket: "disconnect",
            statusBtnWebsocket: "red",
            isConnect: true,
            aksesResponPasien: true,
            listConfig: {
                autoRefresh: true
            }
        },
        formulas: {
            autoRefreshIcon: function (a) {
                return a("listConfig.autoRefresh") ? "x-fa fa-stop" : "x-fa fa-play"
            },
            tooltipAutoRefresh: function (a) {
                return a("listConfig.autoRefresh") ? "Hentikan Perbarui Otomatis" : "Jalankan Perbarui Otomatis"
            }
        }
    },
    initComponent: function () {
        var d = this;
        if (window.location.protocol == "http:") {
            var b = "ws"
        } else {
            var b = "wss"
        }
        d.createMenuContext();
        var a = Ext.create("Ext.ux.WebSocket", {
            url: "ws://" + window.location.hostname + ":8899",
            listeners: {
                message: function (e, g) {
                    var f = JSON.parse(g);
                    if (f != null) {
                        if (f.act) {
                            if (f.act == "ANTRIAN_BARU") {
                                if (d.down("[reference=fpos]").getValue() == f.pos) {
                                    d.getViewModel().get("store").reload()
                                }
                            }
                        }
                    }
                }
            }
        });
        d.dockedItems = [{
            xtype: "toolbar",
            dock: "top",
            style: "background:#19c5bf;border:1px #CCC solid",
            items: [{
                ui: "soft-red",
                text: "Antrian Kemkes",
                reference: "btnAntrian",
                hidden: true,
                tooltip: "Setting",
                listeners: {
                    click: "onToPendaftaranOnline"
                }
            }, "->", {
                bind: {
                    html: '<span style="color:{statusBtnWebsocket}">{statusWebsocket}</span>'
                }
            }, {
                xtype: "combobox",
                name: "POS_ANTRIAN",
                allowBlank: false,
                enterFocus: true,
                reference: "fpos",
                enforceMaxLength: true,
                forceSelection: true,
                validateOnBlur: true,
                displayField: "DESKRIPSI",
                valueField: "NOMOR",
                queryMode: "local",
                typeAhead: true,
                emptyText: "[ Pilih Pos Antrian ]",
                store: {
                    model: "data.model.Kategori"
                },
                reference: "fpos",
                listeners: {
                    select: "onChangeTgl"
                }
            }, {
                xtype: "antrian-combo-poli",
                emptyText: "[ Semua Poliklinik ]",
                enterFocus: true,
                enforceMaxLength: true,
                forceSelection: true,
                validateOnBlur: true,
                allowBlank: false,
                reference: "fpoli",
                name: "POLI",
                listeners: {
                    select: "onChangeTgl"
                }
            }, {
                xtype: "antrian-combo-loket",
                emptyText: "[ Pilih Loket ]",
                name: "LOKET",
                firstLoad: true,
                reference: "loketpemanggil",
                listeners: {
                    select: "onChangeLoket"
                }
            }, {
                text: "Buka Loket",
                ui: "soft-red",
                tooltip: "Buka Loket",
                bind: {
                    hidden: "{isConnect}"
                },
                listeners: {
                    click: "onBukaLoket"
                }
            }, {
                text: "Tutup Loket",
                ui: "soft-blue",
                tooltip: "Tutup Loket",
                bind: {
                    hidden: "{!isConnect}"
                },
                listeners: {
                    click: "onTutupLoket"
                }
            }, {
                xtype: "datefield",
                name: "FTANGGAL",
                format: "d-m-Y",
                reference: "ftanggal",
                listeners: {
                    change: "onChangeTgl"
                }
            }, {
                xtype: "antrian-combo-jenis",
                name: "JENIS",
                firstLoad: true,
                reference: "fjenis",
                listeners: {
                    select: "onChangeTgl"
                }
            }, {
                xtype: "combo",
                reference: "combointerval",
                width: 75,
                store: {
                    fields: ["ID"],
                    data: [{
                        ID: 5
                    }, {
                        ID: 10
                    }, {
                        ID: 15
                    }, {
                        ID: 20
                    }, {
                        ID: 25
                    }, {
                        ID: 30
                    }]
                },
                editable: false,
                displayField: "ID",
                valueField: "ID",
                value: 15,
                bind: {
                    disabled: "{listConfig.autoRefresh}"
                }
            }, {
                xtype: "button",
                enableToggle: true,
                pressed: true,
                bind: {
                    iconCls: "{autoRefreshIcon}",
                    tooltip: "{tooltipAutoRefresh}"
                },
                toggleHandler: "onToggleRefresh"
            }]
        }, {
            xtype: "pagingtoolbar",
            bind: {
                store: "{store}"
            },
            dock: "bottom",
            displayInfo: true,
            items: ["-", {}, {}, {
                xtype: "search-field",
                cls: "x-text-border",
                autoFocus: true,
                emptyText: "Cari Nama Pasien",
                flex: 2,
                listeners: {
                    search: "onsearch",
                    clear: "onClear"
                }
            }, {
                xtype: "combobox",
                reference: "statusrespon",
                emptyText: "[ Filter Status ]",
                store: Ext.create("Ext.data.Store", {
                    fields: ["value", "desk"],
                    data: [{
                        value: "ALL",
                        desk: "Semua"
                    }, {
                        value: "1",
                        desk: "Belum Respon"
                    }, {
                        value: "2",
                        desk: "Sudah Respon"
                    }]
                }),
                queryMode: "local",
                displayField: "desk",
                value: 1,
                flex: 1,
                valueField: "value",
                listeners: {
                    select: "onChangeTgl"
                }
            }, {
                xtype: "combobox",
                reference: "jeniscarabayar",
                emptyText: "[ Filter Penjamin ]",
                store: Ext.create("Ext.data.Store", {
                    fields: ["value", "desk"],
                    data: [{
                        value: "0",
                        desk: "Semua"
                    }, {
                        value: "1",
                        desk: "Umum / Corporate"
                    }, {
                        value: "2",
                        desk: "BPJS / JKN"
                    }]
                }),
                queryMode: "local",
                displayField: "desk",
                flex: 1,
                valueField: "value",
                listeners: {
                    select: "onSelectCaraBayar"
                }
            }]
        }], d.columns = [{
            text: "Pos | Loket",
            dataIndex: "POS_ANTRIAN",
            align: "left",
            flex: 0.3,
            menuDisabled: true,
            sortable: false,
            renderer: "onPostAntrian"
        }, {
            text: "Jenis",
            align: "left",
            menuDisabled: true,
            sortable: false,
            dataIndex: "JENIS_APLIKASI",
            flex: 0.3,
            renderer: "onRenderJenisApp"
        }, {
            text: "No.Antrian",
            dataIndex: "NO",
            menuDisabled: true,
            sortable: false,
            align: "left",
            flex: 0.3,
            renderer: "onAntrian"
        }, {
            text: "Poliklinik Tujuan",
            flex: 1,
            columns: [{
                text: "ANTRIAN",
                dataIndex: "ANTRIAN_POLI",
                menuDisabled: true,
                sortable: false,
                align: "left",
                flex: 0.3,
                renderer: "onAntrianPoli"
            }, {
                text: "Estimasi JAM",
                dataIndex: "NO",
                menuDisabled: true,
                sortable: false,
                align: "left",
                flex: 0.3,
                renderer: "onJamPelayanan"
            }, {
                text: "Nama Poliklinik",
                dataIndex: "POLI",
                menuDisabled: true,
                sortable: false,
                align: "left",
                flex: 0.5,
                renderer: "onPoli"
            }]
        }, {
            text: "Dokter",
            align: "left",
            menuDisabled: true,
            sortable: false,
            dataIndex: "DOKTER",
            flex: 0.5,
            renderer: "onDokter"
        }, {
            text: "Cara Bayar",
            align: "left",
            menuDisabled: true,
            sortable: false,
            dataIndex: "CARABAYAR",
            flex: 0.5,
            renderer: "onCaraBayar"
        }, {
            text: "No RM",
            align: "left",
            menuDisabled: true,
            sortable: false,
            dataIndex: "NORM",
            width: 80,
            renderer: "onNorm"
        }, {
            text: "Nama",
            dataIndex: "NAMA",
            align: "left",
            menuDisabled: true,
            sortable: false,
            renderer: "onRenderNama",
            flex: 0.5
        }, {
            text: "Contact",
            align: "left",
            menuDisabled: true,
            sortable: false,
            dataIndex: "CONTACT",
            flex: 0.5,
            renderer: "onCont"
        }, {
            text: "Tgl. Lahir",
            dataIndex: "TANGGAL_LAHIR",
            menuDisabled: true,
            sortable: false,
            align: "left",
            renderer: "onRenderTgl",
            flex: 0.5
        }, {
            text: "Jenis",
            align: "left",
            dataIndex: "JENIS",
            menuDisabled: true,
            sortable: false,
            flex: 0.5,
            renderer: "onRenderJenis"
        }, {
            text: "Panggil",
            menuDisabled: true,
            sortable: false,
            xtype: "actioncolumn",
            align: "center",
            width: 50,
            items: [{
                xtype: "tool",
                iconCls: "x-fa fa-bullhorn",
                tooltip: "Panggil Antrian",
                handler: "onClickPanggil"
            }]
        }, {
            text: "Res",
            xtype: "actioncolumn",
            menuDisabled: true,
            sortable: false,
            align: "center",
            width: 50,
            items: [{
                xtype: "tool",
                iconCls: "x-fa fa-arrow-circle-right",
                tooltip: "Respon Kedatangan Pasien",
                handler: "onClickRespon"
            }]
        }];
        d.callParent(arguments)
    },
    listeners: {
        rowcontextmenu: "onKlikKananMenu"
    },
    createMenuContext: function () {
        var b = this;
        b.menucontext = new Ext.menu.Menu({
            items: [{
                text: "Refresh",
                glyph: "xf021@FontAwesome",
                handler: function () {
                    b.getController().onRefresh()
                }
            }, {
                text: "Check In Waktu Tunggu Admisi (1)",
                iconCls: "x-fa fa-arrow-circle-right",
                action: 1,
                handler: function () {
                    b.getController().onUpdateWaktuTunggu("3")
                }
            }]
        });
        return b.menucontext
    },
    onSetGrid: function () {
        var h = this,
            b = h.getViewModel(),
            a = h.down("[reference = btnAntrian]"),
            j = h.down("[reference=fpos]"),
            e = webservice.app.xpriv,
            g = h.down("[reference=ftanggal]"),
            k = Ext.Date.format(b.get("tgltemp"), "d-m-Y"),
            d = Ext.Date.format(h.getSysdate(), "d-m-Y"),
            f = Ext.Date.format(h.getSysdate(), "Y-m-d");
        j.getStore().loadData(h.getAksesPosAntrian());
        a.setHidden(!(e("900301", true) && e("900302", true)));
        if (h.getPropertyConfig("900304") == "TRUE") {
            b.set("aksesResponPasien", true)
        } else {
            b.set("aksesResponPasien", false)
        }
        if (k != d) {
            g.setValue(h.getSysdate());
            b.set("tgltemp", h.getSysdate())
        }
        b.set("tglSkrng", f)
    },
    getAksesPosAntrian: function () {
        var a = this;
        return a.penggunaAksesPos ? a.penggunaAksesPos : []
    },
    loadData: function () {
        var a = this,
            b = SIMpel.app.getApplication();
        Ext.Ajax.request({
            url: webservice.location + "registrasionline/plugins/getAksesPosAntrian",
            useDefaultXhrHeader: false,
            withCredentials: true,
            success: function (e) {
                var d = Ext.JSON.decode(e.responseText);
                var f = d.data.AKSES_POS_ANTRIAN;
                a.penggunaAksesPos = f;
                a.onSetGrid(f)
            },
            failure: function (d) {
                return []
            }
        })
    }
});
Ext.define("antrian.monitorin.ListController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-monitoring-list",
    websocket: undefined,
    init: function () {
        var d = this;
        if (window.location.protocol == "http:") {
            var b = "ws"
        } else {
            var b = "wss"
        }
        var a = b + "://" + window.location.hostname + ":8899";
        d.websocket = new WebSocket(a);
        d.websocket.onopen = function (e) {
            d.getViewModel().set("statusWebsocket", "Connected");
            d.getViewModel().set("statusBtnWebsocket", "green")
        };
        d.websocket.onerror = function (e) {
            d.getViewModel().set("statusWebsocket", "Error");
            d.getViewModel().set("statusBtnWebsocket", "red")
        };
        d.websocket.onclose = function (e) {
            d.getViewModel().set("statusWebsocket", "Disconnect");
            d.getViewModel().set("statusBtnWebsocket", "red")
        }
    },
    onToPendaftaranOnline: function () {
        var a = this.getView();
        a.fireEvent("changeActiveLayout", 0)
    },
    onsearch: function (j, g) {
        var h = this,
            a = h.getView(),
            d = h.getViewModel(),
            b = d.get("store");
        if (b) {
            b.removeAll();
            parameter = b.getQueryParams();
            b.setQueryParams({
                QUERY: g,
                TANGGALKUNJUNGAN: parameter.TANGGALKUNJUNGAN
            });
            b.load()
        }
    },
    onSelectStatus: function (b, g) {
        var f = this,
            e = f.getViewModel(),
            d = e.get("store");
        if (g.get("value") == "0") {
            delete d.queryParams.STATUS;
            d.removeAll()
        } else {
            d.removeAll();
            parameter = d.getQueryParams();
            d.setQueryParams({
                STATUS: g.get("value"),
                TANGGALKUNJUNGAN: parameter.TANGGALKUNJUNGAN,
                QUERY: parameter.QUERY
            })
        }
        d.load()
    },
    onSelectCaraBayar: function (b, g) {
        var f = this,
            e = f.getViewModel(),
            d = e.get("store");
        d.removeAll();
        parameter = d.getQueryParams();
        d.setQueryParams({
            FILTER_CB: g.get("value"),
            TANGGALKUNJUNGAN: parameter.TANGGALKUNJUNGAN,
            POS_ANTRIAN: parameter.POS_ANTRIAN
        });
        if (g.get("value") == "0") {
            delete d.queryParams.FILTER_CB
        }
        d.load()
    },
    onSelectPos: function (b, g) {
        var f = this,
            e = f.getViewModel(),
            d = e.get("store");
        if (g.get("value") == "0") {
            delete d.queryParams.POS_ANTRIAN;
            d.removeAll();
            d.load()
        } else {
            d.removeAll();
            parameter = d.getQueryParams();
            d.setQueryParams({
                POS_ANTRIAN: g.get("value"),
                TANGGALKUNJUNGAN: parameter.TANGGALKUNJUNGAN,
                STATUS: parameter.STATUS,
                QUERY: parameter.QUERY
            });
            d.load()
        }
    },
    onClear: function () {
        var e = this,
            f = e.getViewModel(),
            a = f.get("store");
        delete a.queryParams.QUERY;
        a.removeAll();
        a.load()
    },
    onToggleRefresh: function (e, g) {
        var f = this,
            a = f.getView(),
            d = f.getReferences(),
            b = Number(d.combointerval.getValue()) * 1000;
        a.setListConfig({
            autoRefresh: e.pressed
        });
        if (e.pressed) {
            a.start(b)
        } else {
            a.stop()
        }
    },
    onSetting: function (b) {
        var d = this,
            a = d.getView();
        dialog = a.openDialog("", true, 0, 0, {
            xtype: "antrian-monitoring-pengaturan-workspace",
            header: {
                iconCls: "x-fa fa-cog",
                padding: "7px 7px 7px 7px",
                title: "Pengaturan Registrasi Online"
            },
            ui: "panel-cyan",
            showCloseButton: true,
            hideColumns: true
        }, function (f, g) {
            var e = g.down("antrian-monitoring-pengaturan-workspace");
            e.load({})
        })
    },
    onSettingRuangan: function (b) {
        var d = this,
            a = d.getView();
        dialog = a.openDialog("", true, 0, 0, {
            xtype: "antrian-monitoring-ruangan-workspace",
            ui: "panel-cyan",
            showCloseButton: true,
            hideColumns: true
        }, function (f, g) {
            var e = g.down("antrian-monitoring-ruangan-workspace");
            e.onLoadRecord()
        })
    },
    onJadwalDokter: function (b) {
        var d = this,
            a = d.getView();
        dialog = a.openDialog("", true, 0, 0, {
            xtype: "monitoringantrian-kemkes-jadwaldokter-workspace",
            header: {
                iconCls: "x-fa fa-users",
                padding: "7px 7px 7px 7px",
                title: "Jadwal Dokter"
            },
            ui: "panel-cyan",
            showCloseButton: true,
            hideColumns: true
        }, function (f, g) {
            var e = g.down("monitoringantrian-kemkes-jadwaldokter-workspace");
            e.load()
        })
    },
    onChangeTgl: function (r, f, b, h) {
        var j = this,
            m = j.getReferences(),
            a = m.ftanggal,
            q = m.fjenis.getValue(),
            l = m.fpos.getValue(),
            p = m.fpoli.getValue(),
            g = m.statusrespon.getValue(),
            k = m.fpoli.getStore(),
            d = {};
        obj = {
            TANGGALKUNJUNGAN: Ext.Date.format(a.getValue(), "Y-m-d"),
            POS_ANTRIAN: ""
        };
        if (r.name == "POS_ANTRIAN") {
            k.queryParams.ANTRIAN = l;
            k.load()
        }
        if (q) {
            d = {
                JENIS: q
            };
            obj = Ext.apply(obj, d)
        }
        if (l) {
            d = {
                POS_ANTRIAN: l
            };
            obj = Ext.apply(obj, d)
        }
        if (p) {
            d = {
                POLI: p
            };
            obj = Ext.apply(obj, d)
        }
        if (g) {
            d = {
                STATUS: g
            };
            obj = Ext.apply(obj, d)
        }
        j.getView().load(obj)
    },
    onPostAntrian: function (b, a, e) {
        var d = e.get("REFERENSI") ? e.get("REFERENSI").POS_ANTRIAN.DESKRIPSI + " | " + e.get("REFERENSI").LOKET_PANGGIL : "-";
        this.setBackGround(a, e.get("REFERENSI").STATUS_PANGGIL);
        return d
    },
    onRenderJenis: function (d, b, f) {
        var e = f.get("REFERENSI") ? f.get("REFERENSI").JENIS_PSN.DESKRIPSI : "Baru";
        if (f.get("JENIS_APLIKASI") == 2) {
            if (f.get("WAKTU_CHECK_IN") != "") {
                var a = e + " | " + f.get("WAKTU_CHECK_IN")
            } else {
                var a = e
            }
        } else {
            var a = e
        }
        this.setBackGround(b, f.get("REFERENSI").STATUS_PANGGIL);
        return a
    },
    onRenderJenisApp: function (b, a, e) {
        var d = e.get("REFERENSI").JENIS_APP;
        this.setBackGround(a, e.get("REFERENSI").STATUS_PANGGIL);
        return d
    },
    onRenderNama: function (b, a, e) {
        var d = e.get("NAMA");
        this.setBackGround(a, e.get("REFERENSI").STATUS_PANGGIL);
        return d
    },
    onAntrian: function (d, b, e) {
        this.setBackGround(b, e.get("REFERENSI").STATUS_PANGGIL);
        if (e.get("CARABAYAR") == 2) {
            var a = 2
        } else {
            var a = 1
        }
        return e.get("POS_ANTRIAN") + "" + a + "-" + Ext.String.leftPad(d, 3, "0")
    },
    onAntrianPoli: function (d, b, e) {
        this.setBackGround(b, e.get("REFERENSI").STATUS_PANGGIL);
        if (e.get("CARABAYAR") == 2) {
            var a = 2
        } else {
            var a = 1
        }
        return e.get("POS_ANTRIAN") + "" + a + "-" + Ext.String.leftPad(d, 3, "0")
    },
    onJamPelayanan: function (d, b, e) {
        this.setBackGround(b, e.get("REFERENSI").STATUS_PANGGIL);
        var a = e.get("REFERENSI") ? e.get("REFERENSI").ESTIMASI_JAM_PELAYANAN : "-";
        return a
    },
    onPoli: function (d, b, e) {
        if (e.get("JENIS_APLIKASI") == 2) {
            var a = e.get("REFERENSI").POLI_BPJS.NMPOLI
        } else {
            if (e.get("JENIS_APLIKASI") == 5) {
                var a = "-"
            } else {
                var a = e.get("REFERENSI").POLI.DESKRIPSI
            }
        }
        this.setBackGround(b, e.get("REFERENSI").STATUS_PANGGIL);
        return a
    },
    onDokter: function (d, b, e) {
        var a = e.get("REFERENSI").DOKTER_HFIS.NM_DOKTER;
        this.setBackGround(b, e.get("REFERENSI").STATUS_PANGGIL);
        return a
    },
    onRenderStatusCheckOut: function (d, b, e) {
        if (e.get("JENIS_APLIKASI") == 2) {
            if (e.get("STATUS_TASK_ID3") == 1) {
                var a = e.get("REFERENSI").TASK_ID_ANTRIAN.TASK_3
            } else {
                var a = "-"
            }
        } else {
            var a = "-"
        }
        this.setBackGround(b, e.get("REFERENSI").STATUS_PANGGIL);
        return a
    },
    onTglK: function (b, a, d) {
        this.setBackGround(a, d.get("REFERENSI").STATUS_PANGGIL);
        return Ext.Date.format(d.get("TANGGALKUNJUNGAN"), "d-m-Y")
    },
    onCaraBayar: function (b, a, e) {
        var d = e.get("REFERENSI").CARABAYAR.DESKRIPSI;
        this.setBackGround(a, e.get("REFERENSI").STATUS_PANGGIL);
        return d
    },
    onNorm: function (d, b, e) {
        var a = e.get("NORM") == 0 ? 0 : e.get("NORM");
        this.setBackGround(b, e.get("REFERENSI").STATUS_PANGGIL);
        return a
    },
    onCont: function (b, a, d) {
        this.setBackGround(a, d.get("REFERENSI").STATUS_PANGGIL);
        return b
    },
    onRenderTgl: function (b, a, e) {
        var d = Ext.Date.format(b, "Y-m-d H:i:s");
        this.setBackGround(a, e.get("REFERENSI").STATUS_PANGGIL);
        return d
    },
    setBackGround: function (b, a) {
        if (a == 2) {
            b.style = "background-color:#0df775;color:#000000;font-weight: bold"
        }
        if (a == 1) {
            b.style = "color:#000000;font-weight: bold"
        }
        if (a == 99) {
            b.style = "background-color:#00BFFF;color:#000000;font-weight: bold"
        }
        if (a == 0) {
            b.style = "background-color:#A9A9A9;color:#000000;font-weight: bold"
        }
    },
    onKlikKananMenu: function (e, j, n, k, l) {
        var o = this,
            m = l.getXY();
        l.stopEvent();
        o.getView().menucontext.showAt(m)
    },
    onClickRespon: function (d, g, b) {
        var e = this,
            a = e.getView(),
            f = d.getStore().getAt(g);
        if (f.get("STATUS") == 1) {
            e.onResponPasien(f)
        }
        if (f.get("STATUS") == 2) {
            a.notifyMessage("Data Sudah Di Respon")
        }
        if (f.get("STATUS") == 0) {
            a.notifyMessage("Data Antrian Dibatalkan")
        }
        if (f.get("STATUS") == 99) {
            a.notifyMessage("Pasien Belum Checkin")
        }
    },
    onResponPasien: function (h) {
        var f = this,
            b = f.getView(),
            e = f.getViewModel().get("tglSkrng"),
            d = f.getViewModel().get("store"),
            a = Ext.create("antrian.responantrian.Model", {}),
            g = Ext.Date.format(h.get("TANGGALKUNJUNGAN"), "Y-m-d"),
            j = h.get("JENIS") == 1 ? "Terima kedatangan pasien norm " + h.get("NORM") + " - " + h.get("NAMA") + " ?" : "Terima kedatangan pasien dengan nama " + h.get("NAMA") + " ?";
        if (h.get("STATUS") == 1) {
            if (e == g) {
                Ext.Msg.show({
                    title: "Respon Pasien",
                    message: j,
                    buttons: Ext.Msg.YESNO,
                    icon: Ext.Msg.QUESTION,
                    animateTarget: h,
                    fn: function (k) {
                        if (k === "yes") {
                            b.setLoading(true);
                            a.set("STATUS", 2);
                            a.set("ID", h.get("ID"));
                            a.save({
                                callback: function (m, l, n) {
                                    if (n) {
                                        var o = JSON.parse(l._response.responseText);
                                        b.notifyMessage(o.metadata.message);
                                        d.reload();
                                        f.onResponAntrian(h);
                                        b.setLoading(false)
                                    } else {
                                        b.notifyMessage("Data Gagal Di Respon");
                                        b.setLoading(false)
                                    }
                                }
                            })
                        }
                    }
                })
            } else {
                b.notifyMessage("Pasien Belum Bisa Di Daftar, Hanya tanggal Kunjungan Hari ini yang dapat direspon ( " + e + " | " + g)
            }
        }
    },
    onResponAntrian: function (b) {
        var d = this,
            a = d.getView(),
            e = d.getViewModel().get("aksesResponPasien");
        if (e) {
            a.fireEvent("openpasien", b, b.get("JENIS"))
        }
    },
    onClickPanggil: function (a, o, d) {
        var j = this,
            h = j.getViewModel(),
            n = h.get("store"),
            m = j.getView(),
            f = a.getStore().getAt(o),
            l = j.getReferences(),
            k = l.loketpemanggil.getValue(),
            b = j.getViewModel().get("isConnect"),
            g = Ext.create("antrian.panggilantrian.Model", {});
        if (b) {
            if (j.websocket) {
                if (k != "") {
                    if (f.get("STATUS") == 0) {
                        j.getView().notifyMessage("Status Antrian Sudah Batal", "danger-red");
                        return false
                    }
                    if (f.get("STATUS") == 99) {
                        j.getView().notifyMessage("Status Antrian Belum Check In Mobile JKN / Counter", "danger-red");
                        return false
                    }
                    if (f.get("NO") > 0) {
                        if (f.get("CARABAYAR") == 2) {
                            var e = 2
                        } else {
                            var e = 1
                        }
                        g.set("LOKET", k);
                        g.set("NOMOR", f.get("NO"));
                        g.set("POS", f.get("POS_ANTRIAN"));
                        g.set("TANGGAL", m.getSysdate());
                        g.set("CARA_BAYAR", e);
                        m.setLoading(true);
                        g.save({
                            callback: function (q, r, s) {
                                if (s) {
                                    j.getView().notifyMessage("Antrian Dalam Proses Pemanggilan");
                                    var p = {
                                        loket: k,
                                        pesan: "Silahkan Ke Loket",
                                        pos: f.get("POS_ANTRIAN"),
                                        nomor: f.get("NO"),
                                        carabayar: e,
                                        act: "PANGGIL"
                                    };
                                    if (m.getViewModel().get("statusWebsocket") == "Connected") {
                                        j.websocket.send(JSON.stringify(p))
                                    } else {
                                        m.notifyMessage("Koneksi Socket Terputus", "danger-red")
                                    }
                                    n.reload();
                                    m.setLoading(false)
                                } else {
                                    var t = JSON.parse(r.error.response.responseText);
                                    j.getView().notifyMessage(t.detail, "danger-red");
                                    m.setLoading(false)
                                }
                            }
                        })
                    } else {
                        m.notifyMessage("Nomor Antrian Tidak Di Temukan", "danger-red")
                    }
                } else {
                    m.notifyMessage("Silahkan Pilih Loket Pemanggil", "danger-red")
                }
            } else {
                m.notifyMessage("Koneksi Ke Monitor Terputus", "danger-red")
            }
        } else {
            m.notifyMessage("Silahkan Buka Loket Terlebih Dahulu", "danger-red")
        }
    },
    onUpdateWaktuTunggu: function (a) {
        var b = this,
            d = b.getView().getSelection()[0];
        b.onCheckInWaktuTunggu(d, a)
    },
    onCheckInWaktuTunggu: function (a, e) {
        var f = this,
            d = f.getViewModel(),
            k = d.get("store"),
            j = f.getView(),
            h = f.getReferences(),
            g = h.loketpemanggil.getValue(),
            b = Ext.create("antrian.waktutungguantrian.plugins.Model", {});
        if (g > 0) {
            if (a.get("NO") > 0) {
                b.set("taskid", e);
                b.set("kodebooking", a.get("ID"));
                j.setLoading(true);
                b.save({
                    callback: function (l, m, n) {
                        if (n) {
                            var o = JSON.parse(m._response.responseText);
                            j.notifyMessage(o.metadata.message);
                            k.reload();
                            j.setLoading(false)
                        } else {
                            var o = JSON.parse(m.error.response.responseText);
                            f.getView().notifyMessage(o.detail, "danger-red");
                            j.setLoading(false)
                        }
                    }
                })
            } else {
                j.notifyMessage("Nomor Antrian Tidak Di Temukan", "danger-red")
            }
        } else {
            j.notifyMessage("Silahkan Pilih Loket Pemanggil", "danger-red")
        }
    },
    onRefresh: function () {
        var a = this.getView();
        a.reload()
    },
    onCetakSkrining: function (g) {
        var f = this,
            e = f.getStore("store"),
            d = g.ownerCt.getWidgetRecord();
        d.showError = true;
        d.animateTarget = g;
        d.scope = f;
        f.cetakFormSkrining(d.get("ID"), d)
    },
    privates: {
        cetakFormSkrining: function (j, h) {
            var f = this,
                a = f.getView(),
                b = "Word",
                e = "docx",
                g = true,
                d = "Cetak Form Skrining Vaksin Covid :" + j;
            Ext.Msg.show({
                title: d,
                message: "Tekan tombol Yes/Ya utk cetak langsung<br/>Tekan tombol No/Tidak untuk Preview",
                buttons: Ext.Msg.YESNO,
                icon: Ext.Msg.QUESTION,
                defaultButton: "yes",
                animateTarget: f,
                fn: function (k) {
                    if (k != "yes") {
                        b = "Pdf";
                        e = "pdf";
                        g = false
                    }
                    a.cetak({
                        NAME: "plugins.antrian.online.CetakSkriningCovid",
                        TYPE: b,
                        EXT: e,
                        PARAMETER: {
                            PNOMOR: j
                        },
                        REQUEST_FOR_PRINT: g,
                        PRINT_NAME: "CetakRincian"
                    }, function (l) {
                        a.openDialog("Print Preview", true, 0, 0, {
                            xtype: "panel",
                            title: d
                        }, function (m, n) {
                            n.down("panel").update("<iframe style='width: 100%; height: 100%' src='" + l + "'></iframe>")
                        })
                    })
                }
            })
        }
    },
    onCetak: function (d, f) {
        var b = this,
            a = b.getView(),
            e = d;
        a.cetak({
            NAME: "plugins.antrian.CetakSkriningCovid",
            TYPE: e ? "Pdf" : "Word",
            EXT: e ? "pdf" : "docx",
            PARAMETER: {
                PNOMOR: f
            },
            REQUEST_FOR_PRINT: !e,
            PRINT_NAME: "CetakSkriningCovid"
        }, function (g) {
            if (e) {
                a.openDialog("Print Preview", true, 0, 0, {
                    xtype: "panel",
                    title: "Preview"
                }, function (h, j) {
                    j.down("panel").update("<iframe style='width: 100%; height: 100%' src='" + g + "'></iframe>")
                })
            }
        })
    },
    onChangeLoket: function (f, d) {
        var g = this,
            b = g.getView(),
            e = g.getReferences(),
            a = e.fpos.getValue();
        if (a) {
            g.onCekLoket(a, d.get("ID"), Ext.Date.format(b.getSysdate(), "Y-m-d"))
        } else {
            b.notifyMessage("Silahkan Pilih Pos Antrian", "danger-red");
            g.getViewModel().set("isConnect", true)
        }
    },
    onCekLoket: function (g, e, d) {
        var f = this,
            a = f.getView(),
            b = f.getViewModel().get("storepemanggil");
        if (b) {
            b.queryParams = {
                POS: g,
                LOKET: e,
                TANGGAL: d,
                STATUS: 1
            };
            b.load(function (j, h, k) {
                if (k) {
                    f.getViewModel().set("isConnect", true)
                } else {
                    f.getViewModel().set("isConnect", false)
                }
            })
        }
    },
    onTutupLoket: function () {
        var g = this,
            d = g.getView(),
            e = g.getReferences(),
            f = e.loketpemanggil.getValue(),
            b = e.fpos.getValue(),
            a = Ext.create("antrian.panggilantrian.Model", {});
        if (f) {
            if (b) {
                a.set("LOKET", f);
                a.set("POS", b);
                a.set("TANGGAL", Ext.Date.format(d.getSysdate(), "Y-m-d"));
                a.set("STATUS", 0);
                a.set("STATUS_LOKET", 1);
                d.setLoading(true);
                a.save({
                    callback: function (k, l, m) {
                        if (m) {
                            g.getView().notifyMessage("Loket Antrian Berhasil Di Tutup");
                            var j = {
                                pos: b,
                                act: "REFRESH_LOKET"
                            };
                            if (d.getViewModel().get("statusWebsocket") == "Connected") {
                                g.websocket.send(JSON.stringify(j))
                            }
                            g.onCekLoket(b, f, Ext.Date.format(d.getSysdate(), "Y-m-d"));
                            d.setLoading(false)
                        } else {
                            var n = JSON.parse(l.error.response.responseText);
                            g.getView().notifyMessage(n.detail, "danger-red");
                            d.setLoading(false)
                        }
                    }
                })
            } else {
                d.notifyMessage("Silahkan Pilih Pos Antrian", "danger-red")
            }
        } else {
            d.notifyMessage("Silahkan Pilih Loket", "danger-red")
        }
    },
    onBukaLoket: function () {
        var g = this,
            d = g.getView(),
            e = g.getReferences(),
            f = e.loketpemanggil.getValue(),
            b = e.fpos.getValue(),
            a = Ext.create("antrian.panggilantrian.Model", {});
        if (f) {
            if (b) {
                a.set("LOKET", f);
                a.set("POS", b);
                a.set("TANGGAL", Ext.Date.format(d.getSysdate(), "Y-m-d"));
                a.set("STATUS", 1);
                a.set("STATUS_LOKET", 1);
                d.setLoading(true);
                a.save({
                    callback: function (k, l, m) {
                        if (m) {
                            g.getView().notifyMessage("Loket Antrian Berhasil Di Buka");
                            var j = {
                                act: "REFRESH_LOKET",
                                pos: b
                            };
                            if (d.getViewModel().get("statusWebsocket") == "Connected") {
                                g.websocket.send(JSON.stringify(j))
                            }
                            g.onCekLoket(b, f, Ext.Date.format(d.getSysdate(), "Y-m-d"));
                            d.setLoading(false)
                        } else {
                            var n = JSON.parse(l._response.responseText);
                            g.getView().notifyMessage(n.detail, "danger-red");
                            d.setLoading(false)
                        }
                    }
                })
            } else {
                d.notifyMessage("Silahkan Pilih Pos Antrian", "danger-red")
            }
        } else {
            d.notifyMessage("Silahkan Pilih Loket", "danger-red")
        }
    },
    onJadwalDokter: function (b) {
        var d = this,
            a = d.getView();
        a.openDialog("", true, 0, 0, {
            xtype: "antrian-monitoring-jadwal-Workspace",
            showCloseButton: true,
            title: "Jadwal Dokter",
            ui: "panel-cyan",
            iconCls: b.iconCls
        }, function (f, g) {
            var e = g.down("antrian-monitoring-jadwal-Workspace");
            e.load({})
        }, b)
    }
});
Ext.define("antrian.monitoring.Workspace", {
    extend: "com.Form",
    xtype: "antrian-monitoring-workspace",
    controller: "antrian-monitoring-workspace",
    viewModel: {
        stores: {
            pendaftaranstore: {
                type: "pendaftaran-store"
            },
            storepsn: {
                type: "pasien-store",
                queryParams: {
                    NORM: 0,
                    start: 0,
                    limit: 1
                }
            }
        }
    },
    bodyPadding: 2,
    layout: "fit",
    border: true,
    initComponent: function () {
        var a = this;
        a.items = [{
            region: "center",
            xtype: "container",
            flex: 1,
            layout: "card"
        }];
        a.callParent(arguments)
    },
    load: function () {
        var b = this,
            d = webservice.app.xpriv,
            a = b.down("container");
        if (d("900302", true)) {
            list = Ext.create("antrian.monitoring.List", {
                flex: 1,
                listeners: {
                    changeActiveLayout: "onChangeActive",
                    openpasien: "onResponPasien"
                }
            });
            a.add(list);
            list.loadData()
        }
        if (d("900301", true)) {
            kemkes = Ext.create("antrian.monitoring.kemkes.reservasi.Grid", {
                flex: 1,
                listeners: {
                    changeActiveLayout: "onChangeActive",
                    openpasien: "onResponPasien"
                }
            });
            a.add(kemkes);
            kemkes.loadData()
        }
    },
    refresh: function () {
        var a = this,
            d = a.down("monitoringantrian-kemkes-reservasi-grid"),
            b = a.down("list-monitoring-antrian");
        d.loadData();
        b.loadData()
    },
    getIndexItem: function (d) {
        var b = this,
            a = -1;
        b.items.eachKey(function (e) {
            if (e.indexOf(d) > -1) {
                a = b.items.indexOfKey(e)
            }
        });
        return a
    },
    createPasienForm: function () {
        var a = this;
        if (Ext.getClassName(a.items.getAt(0)) != "pasien.Form") {
            if (a.formSelected) {
                a.remove(a.formSelected, true)
            }
            a.formSelected = a.add({
                xtype: "pasien-form",
                scrollable: true,
                listeners: {
                    simpansuccess: "onSimpanPasien",
                    batal: "onBatalForm"
                }
            })
        }
    },
    createPendaftaranForm: function () {
        var a = this;
        if (a.formSelected) {
            a.remove(a.formSelected, true)
        }
        a.formSelected = a.add({
            xtype: "pendaftaran-form",
            scrollable: true,
            listeners: {
                simpansuccess: "onSimpanPendaftaran",
                cetakbukti: "onCetakBukti",
                cetakbarcode: "onCetakBarcodePendaftaran",
                cetaktracert: "onCetakTracert",
                cetakmr1: "onCetakMR1",
                cetakgelang: "onCetakGelang",
                batal: "onBatalForm"
            }
        });
        a.formSelected = a.down("pendaftaran-form");
        a.formSelected.loadRecord({})
    },
    isFoundRujukan: function (b, d) {
        var a = this;
        a.integrasi = a.app.xitr("ID", 1);
        if (a.integrasi) {
            a.service = Ext.create(a.integrasi.NAMA_KLAS, {})
        }
        if (a.service) {
            a.service.cariRujukanDgnNoRujukan(b, function (f, e) {
                if (f) {
                    d(e.data.rujukan)
                }
            })
        }
    }
});
Ext.define("antrian.monitorin.WorkspaceController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-monitoring-workspace",
    onChangeActive: function (a) {
        var e = this,
            d = e.getView(),
            b = d.down("container");
        b.getLayout().setActiveItem(a)
    },
    onCekStatusPendaftaran: function (d) {
        var e = this,
            b = e.getViewModel(),
            a = b.get("pendaftaranstore");
        a.queryParams = {
            NORM: d,
            STATUS: 1,
            start: 0,
            limit: 1
        };
        a.load(function (j, f, g) {
            if (j.length > 0) {
                return true
            }
        })
    },
    onResponPasien: function (d, b) {
        var f = this,
            a = f.getView(),
            e = a.ownerCt.getController();
        if (b == 2) {
            f.onBaru(d)
        } else {
            if (d.get("JENIS_APLIKASI") == 5) {
                f.onBaru(d)
            } else {
                if (a.getPropertyConfig("900306") == "TRUE") {
                    if (a.getPropertyConfig("50") == "TRUE") {
                        f.onRegBaru(d)
                    } else {
                        data.model.Pasien.load(d.get("NORM"), {
                            success: function (g, h) {
                                a.fireEvent("onTabPasien", g, f.getIconSex(g), true, "pasien.Workspace", "psn-" + g.getId(), e.toFormatNorm(g.getId()))
                            }
                        })
                    }
                } else {
                    data.model.Pasien.load(d.get("NORM"), {
                        success: function (g, h) {
                            a.fireEvent("onTabPasien", g, f.getIconSex(g), true, "pasien.Workspace", "psn-" + g.getId(), e.toFormatNorm(g.getId()))
                        }
                    })
                }
            }
        }
    },
    setActiveItem: function (e) {
        var d = this,
            a = d.getView(),
            b = a.getLayout();
        if (e == "pendaftaran-form") {
            a.createPendaftaranForm()
        }
        a.ownerCt.setActiveItem(a.getIndexItem(e));
        return a.ownerCt.getActiveItem()
    },
    onRegBaru: function (b) {
        var f = this,
            a = f.getView(),
            d = false,
            e = a.ownerCt.getController();
        f.integrasi = a.app.xitr("ID", 1);
        if (f.integrasi) {
            f.service = Ext.create(f.integrasi.NAMA_KLAS, {})
        }
        data.model.Pasien.load(b.get("NORM"), {
            success: function (h, j) {
                var g = "x-fa fa-" + (h.get("JENIS_KELAMIN") == 1 ? "male" : "female");
                e.createWorkspace(h, g, true, "pasien.Workspace", "psn-" + e.toFormatNorm(h.getId()), e.toFormatNorm(h.getId()), "", "", function (k) {
                    a.isFoundRujukan(b.get("NO_REF_BPJS"), function (m) {
                        if (m) {
                            d = true
                        }
                        var l = Ext.create("data.model.Pendaftaran", {
                            NORM: b.get("NORM"),
                            REFERENSI: {
                                DOKTER: b.get("REFERENSI").DOKTER_PENJAMIN.REFERENSI.DOKTER,
                                SMF: b.get("REFERENSI").DOKTER_PENJAMIN.REFERENSI.DOKTER.REFERENSI.SMF,
                                RUANGAN: b.get("REFERENSI").RUANGAN,
                                CARABAYAR: b.get("REFERENSI").CARABAYAR,
                                DPJP: b.get("DOKTER"),
                                DPJP_LAYANAN: b.get("DOKTER"),
                                TUJUAN_KUNJUNGAN: b.get("TUJUAN_KUNJUNGAN") ? b.get("TUJUAN_KUNJUNGAN") : "",
                                PROCEDURE: b.get("PROCEDURE") ? b.get("PROCEDURE") : "",
                                PENUNJANG: b.get("PENUNJANG") ? b.get("PENUNJANG") : "",
                                ASSESMENT_PELAYANAN: b.get("ASSESMENT_PELAYANAN") ? b.get("ASSESMENT_PELAYANAN") : "",
                                DIAGNOSA_MASUK: {
                                    ICD: d ? m.diagnosa.kode : "",
                                    DIAGNOSA: d ? m.diagnosa.nama : "",
                                    REFERENSI: {
                                        DIAGNOSA: {
                                            CODE: d ? m.diagnosa.kode : "",
                                            STR: d ? m.diagnosa.nama : ""
                                        }
                                    }
                                },
                                RUJUKAN: {
                                    NO_RUJUKAN: d ? m.noKunjungan : "",
                                    TGL_RUJUKAN: d ? m.tglKunjungan : "",
                                    ASAL_RUJUKAN: {
                                        KODE: d ? m.provPerujuk.kode : "",
                                        NAMA: d ? m.provPerujuk.nama : ""
                                    }
                                }
                            },
                            JENIS: b.get("REFERENSI").CARABAYAR
                        });
                        console.log("antrian");
                        console.log(l);
                        k.getViewModel().set("pendaftaran", l);
                        k.down("pasien-dashboard").getViewModel().set("pasien", h);
                        k.down("pasien-dashboard").getViewModel().set("pendaftaran", l);
                        k.down("pasien-dashboard").getController().onBaruFromAntrian(h)
                    })
                })
            },
            failure: function (g, h) {}
        })
    },
    onBaru: function (b) {
        var d = this,
            a = d.getView(),
            e = new data.model.Pasien(),
            f = e.getId().replace("data.model.", "");
        e.set("NAMA", b.get("NAMA"));
        e.set("TEMPAT_LAHIR", b.get("TEMPAT_LAHIR"));
        e.set("TANGGAL_LAHIR", b.get("TANGGAL_LAHIR"));
        a.fireEvent("onTabPasien", e, d.getIconSex(e), true, "pasien.Workspace", f, f)
    },
    privates: {
        getIconSex: function (a) {
            return "x-fa fa-" + (a.get("JENIS_KELAMIN") == 1 ? "male" : "female")
        },
        toFormatNorm: function (b) {
            var a = Ext.String.leftPad(b, 8, "0"),
                d = Ext.String.insert(Ext.String.insert(Ext.String.insert(a, ".", 2), ".", 5), ".", 8);
            return d
        }
    }
});
Ext.define("antrian.monitoring.jadwal.Form", {
    extend: "com.Form",
    xtype: "antrian-monitoring-jadwal-form",
    controller: "antrian-monitoring-jadwal-form",
    model: "antrian.jadwal.Model",
    defaults: {
        border: false
    },
    items: [{
        layout: "vbox",
        defaults: {
            margin: "1 1 1 1",
            allowBlank: false,
            width: "100%"
        },
        items: [{
            xtype: "combo",
            emptyText: "[ Hari ]",
            store: Ext.create("data.store.Store", {
                fields: ["ID", "DEKS"],
                data: [{
                    ID: 0,
                    DESK: "Senin"
                }, {
                    ID: 1,
                    DESK: "Selasa"
                }, {
                    ID: 2,
                    DESK: "Rabu"
                }, {
                    ID: 3,
                    DESK: "Kamis"
                }, {
                    ID: 4,
                    DESK: "Jumat"
                }, {
                    ID: 5,
                    DESK: "Sabtu"
                }, {
                    ID: 6,
                    DESK: "Minggu"
                }]
            }),
            valueField: "ID",
            displayField: "DESK",
            name: "HARI"
        }]
    }, {
        layout: "hbox",
        defaults: {
            margin: "1 1 1 1",
            allowBlank: false,
            width: "50%"
        },
        defaultType: "timefield",
        items: [{
            emptyText: "[ Jam Mulai ]",
            format: "H:i:s",
            name: "MULAI",
            minValue: "07:00:00",
            maxValue: "23:00:00"
        }, {
            emptyText: "[ Jam Selesai ]",
            format: "H:i:s",
            name: "SELESAI",
            minValue: "07:00:00",
            maxValue: "23:00:00"
        }]
    }, {
        layout: "hbox",
        defaults: {
            margin: "1 1 1 1",
            allowBlank: false,
            format: "Y-m-d",
            width: "50%"
        },
        defaultType: "datefield",
        items: [{
            emptyText: "[ Tanggal Mulai ]",
            name: "TANGGAL_AWAL"
        }, {
            emptyText: "[ Tanggal Akhir ]",
            name: "TANGGAL_AKHIR"
        }]
    }],
    buttons: [{
        text: "Simpan",
        iconCls: "x-fa fa-save",
        ui: "soft-blue",
        handler: "onCLickBtnSimpan"
    }]
});
Ext.define("antrian.monitoring.jadwal.FormController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-monitoring-jadwal-form",
    onCLickBtnSimpan: function (b) {
        var d = this,
            a = d.getView();
        if (a.getForm().isValid()) {
            a.setLoading(true);
            a.save(b, {}, function (f, e, g) {
                if (g) {
                    a.setLoading(false)
                } else {
                    a.setLoading(false)
                }
            })
        }
    }
});
Ext.define("antrian.monitoring.jadwal.Grid", {
    extend: "com.Grid",
    xtype: "antrian-monitoring-jadwal-grid",
    controller: "antrian-monitoring-jadwal-grid",
    viewModel: {
        stores: {
            store: {
                type: "antrian-jadwal-store"
            }
        }
    },
    columns: [{
        xtype: "rownumberer",
        text: "No",
        align: "left",
        width: 60
    }, {
        xtype: "templatecolumn",
        text: "Dokter",
        dataIndex: "DOKTER",
        flex: 1,
        tpl: new Ext.XTemplate('<div class="thumb-wrap">', '<div class="thumb">', "<div>{[this.getNamaLengkap(values.REFERENSI.PEGAWAI)]}</div>", "<div>{DOKTER}</div>", "</div>", "</div>", {
            getNamaLengkap: function (b) {
                var e = b.GELAR_DEPAN ? b.GELAR_DEPAN + ". " : "",
                    a = b.NAMA ? b.NAMA : "",
                    d = b.GELAR_BELAKANG ? ", " + b.GELAR_BELAKANG : "";
                return e + "" + a + "" + d
            }
        })
    }, {
        text: "Jadwal",
        flex: 1,
        columns: [{
            xtype: "templatecolumn",
            text: "Hari",
            dataIndex: "HARI",
            tpl: "<div>{DESK_HARI}</div>"
        }, {
            text: "Jam Mulai",
            dataIndex: "MULAI"
        }, {
            text: "Jam Akhir",
            dataIndex: "SELESAI"
        }, {
            xtype: "templatecolumn",
            text: "Berlaku",
            tpl: new Ext.XTemplate('<div class="thumb-wrap">', '<div class="thumb">', "<div>{[this.formatDate(values.TANGGAL_AWAL)]} s/d</div>", "<div>{[this.formatDate(values.TANGGAL_AKHIR)]}</div>", "</div>", "</div>", {
                formatDate: function (b) {
                    var a = b ? Ext.Date.format(b, "Y-m-d") : "";
                    return a
                }
            })
        }]
    }, {
        xtype: "checkcolumn",
        header: "STATUS",
        dataIndex: "STATUS",
        width: 80,
        listeners: {
            checkchange: "onChangeStatus"
        }
    }, {
        menuDisabled: true,
        sortable: false,
        align: "center",
        xtype: "actioncolumn",
        width: 50,
        items: [{
            iconCls: "x-fa fa-calendar x-color-blue",
            tooltip: "Tanggal",
            handler: "onViewJadwalBerdasarkanTanggal"
        }]
    }]
});
Ext.define("antrian.monitoring.jadwal.GridController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-monitoring-jadwal-grid",
    onChangeStatus: function (f, a, j) {
        var h = this,
            b = h.getView(),
            g = h.getViewModel(),
            d = g.get("store"),
            e = d.getAt(a);
        e.set("STATUS", j ? 1 : 0);
        e.scope = h;
        e.save({
            callback: function (k, l, m) {
                if (m) {
                    b.notifyMessage("Status jadwal dokter di" + (j == true ? "Aktifkan" : "NonAktifkan "), "danger-blue");
                    b.reload()
                }
            }
        })
    },
    onViewJadwalBerdasarkanTanggal: function (d, j, b, k, f, h) {
        var e = this,
            a = e.getView();
        a.openDialog("", true, "60%", 400, {
            xtype: "antrian-monitoring-jadwal-tanggal-workspace",
            showCloseButton: true,
            ui: "panel-cyan",
            title: "Tanggal",
            iconCls: "x-fa fa-edit"
        }, function (m, l) {
            var g = l.down("antrian-monitoring-jadwal-tanggal-workspace");
            g.load(h)
        }, d)
    }
});
Ext.define("antrian.monitoring.jadwal.Workspace", {
    extend: "com.Form",
    xtype: "antrian-monitoring-jadwal-Workspace",
    controller: "antrian-monitoring-jadwal-Workspace",
    layout: {
        type: "border"
    },
    bodyPadding: 1,
    items: [{
        region: "west",
        title: "Ruangan",
        flex: 0.6,
        ui: "panel-black",
        border: true,
        margin: "1 1 1 1",
        iconCls: "x-fa fa-list",
        xtype: "ruangan-list",
        listeners: {
            select: "onSelectListRuangan"
        }
    }, {
        region: "center",
        flex: 1,
        border: false,
        layout: {
            type: "vbox",
            align: "stretch"
        },
        defaults: {
            border: true
        },
        items: [{
            title: "Dokter Ruangan",
            flex: 1,
            ui: "panel-black",
            iconCls: "x-fa fa-users",
            reference: "GridDokterRuangan",
            xtype: "dokterruangan-list"
        }, {
            title: "Jadwal Dokter Ruangan",
            border: true,
            ui: "panel-black",
            iconCls: "x-fa fa-calendar",
            flex: 1,
            reference: "GridJadwal",
            xtype: "antrian-monitoring-jadwal-grid"
        }]
    }],
    initComponent: function () {
        var b = this,
            a = b.getController();
        b.callParent(arguments);
        var d = b.down("dokterruangan-list");
        d.columns.forEach(function (e) {
            if (e.xtype) {
                if (e.xtype == "actioncolumn" || e.xtype == "checkcolumn" || e.xtype == "widgetcolumn") {
                    d.getHeaderContainer().remove(e.fullColumnIndex)
                }
            }
        });
        d.getHeaderContainer().add({
            menuDisabled: true,
            sortable: false,
            align: "center",
            xtype: "actioncolumn",
            width: 50,
            items: [{
                iconCls: "x-fa fa-calendar x-color-black",
                tooltip: "Ubah Pegawai",
                scope: a,
                handler: "onClikJadwalBaru"
            }]
        })
    },
    load: function () {
        var b = this,
            a = b.down("antrian-monitoring-jadwal-grid"),
            e = b.down("ruangan-list"),
            d = b.down("dokterruangan-list");
        a.load({
            RUANGAN: 0
        });
        d.load({
            RUANGAN: 0,
            STATUS: 1
        });
        e.load({
            JENIS: 5,
            JENIS_KUNJUNGAN: 1,
            STATUS: 1
        })
    }
});
Ext.define("antrian.monitoring.jadwal.WorkspaceController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-monitoring-jadwal-Workspace",
    onSelectListRuangan: function (b, e) {
        var d = this,
            a = d.getReferences();
        a.GridJadwal.load({
            RUANGAN: e.get("ID"),
            STATUS: 1
        });
        a.GridDokterRuangan.load({
            RUANGAN: e.get("ID"),
            STATUS: 1
        })
    },
    onClikJadwalBaru: function (n, o, a, l, e, b) {
        var j = this,
            m = j.getView(),
            k = j.getReferences(),
            d = k.GridDokterRuangan,
            f = (b.get("REFERENSI")) ? (b.get("REFERENSI").DOKTER) ? true : false : false,
            h = d.getStore().getQueryParams();
        if (f) {
            m.openDialog("", true, 500, 200, {
                xtype: "antrian-monitoring-jadwal-form",
                showCloseButton: true,
                ui: "panel-cyan",
                title: "Form Tambah Jadwal",
                iconCls: "x-fa fa-edit"
            }, function (q, p) {
                var g = p.down("antrian-monitoring-jadwal-form");
                g.createRecord({
                    DOKTER: b.get("REFERENSI").DOKTER.NIP,
                    RUANGAN: h.RUANGAN,
                    STATUS: 1
                });
                g.on("save", function () {
                    p.close();
                    k.GridJadwal.reload()
                })
            }, n)
        } else {
            m.showMessageBox({
                title: "Warning",
                message: "Dokter tidak terdaftar di master pegawai",
                ui: "window-red",
                buttons: Ext.Msg.OK
            })
        }
    }
});
Ext.define("antrian.monitoring.jadwal.tanggal.Datepicker", {
    extend: "com.Form",
    xtype: "antrian-monitoring-jadwal-tanggal-datepicker",
    viewModel: {
        stores: {
            jadwatTanggalStore: {
                type: "antrian-jadwal-tanggal-store"
            }
        }
    },
    layout: {
        type: "vbox",
        align: "left"
    },
    border: false,
    initComponent: function () {
        var a = this;
        Ext.Date.dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
        Ext.Date.monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        a.items = [{
            xtype: "datepicker",
            flex: 1,
            showToday: false,
            showPrevMonth: function (b) {
                a.fireEvent("loadTanggal", Ext.Date.add(this.activeDate, Ext.Date.MONTH, -1));
                return this.update(Ext.Date.add(this.activeDate, Ext.Date.MONTH, -1))
            },
            showNextMonth: function (b) {
                a.fireEvent("loadTanggal", Ext.Date.add(this.activeDate, Ext.Date.MONTH, 1));
                return this.update(Ext.Date.add(this.activeDate, Ext.Date.MONTH, 1))
            },
            onOkClick: function (d, f) {
                var g = f[0],
                    e = f[1],
                    b = new Date(e, g, this.getActive().getDate());
                a.fireEvent("loadTanggal", Ext.Date.add(b));
                this.update(Ext.Date.add(b));
                this.hideMonthPicker()
            },
            listeners: {
                select: function (d, f) {
                    var e = a.getViewModel(),
                        b = e.get("jadwatTanggalStore");
                    find = b.findRecord("TANGGAL", Ext.Date.format(f, "Y-m-d"), 0, false, true, true);
                    a.fireEvent("selectTanggal", f, find)
                }
            },
            cls: "jadwalDinas"
        }];
        a.callParent(arguments)
    },
    loadJadwal: function (e) {
        var d = this,
            a = d.getViewModel(),
            b = a.get("jadwatTanggalStore");
        d.setLoading(true);
        b.setQueryParams(e);
        b.load({
            callback: function (g, f, h) {
                d.setLoading(false);
                d.highlightDates()
            }
        })
    },
    highlightDates: function () {
        var f = this,
            d = f.getViewModel(),
            e = d.get("jadwatTanggalStore");
        picker = f.down("datepicker"), cells = picker.cells.elements;
        for (var j = 0; j < cells.length; j++) {
            var a = Ext.fly(cells[j]),
                g = a.dom.firstChild.dateValue,
                b = new Date(g),
                h = e.findRecord("TANGGAL", Ext.Date.format(b, "Y-m-d"), 0, false, true, true);
            if (h) {
                a.dom.style = "background-color: #e71f31;"
            } else {
                a.dom.style = "background-color: white;"
            }
        }
    }
});
Ext.define("antrian.monitoring.jadwal.tanggal.Wokrspace", {
    extend: "com.Form",
    xtype: "antrian-monitoring-jadwal-tanggal-workspace",
    controller: "antrian-monitoring-jadwal-tanggal-workspace",
    viewModel: {
        stores: {
            jadwatTanggalStore: {
                type: "antrian-jadwal-tanggal-store"
            }
        },
        data: {
            jadwal: undefined
        }
    },
    bodyPadding: 0,
    layout: {
        type: "hbox",
        align: "stretch"
    },
    items: [{
        xtype: "antrian-monitoring-jadwal-tanggal-datepicker",
        listeners: {
            loadTanggal: "onLoadTanggal",
            selectTanggal: "onSelectTanggal"
        }
    }, {
        title: "Daftar Pengganti",
        margin: "6 6 6 6",
        border: true,
        flex: 1,
        reference: "gridpengganti",
        xtype: "antrian-monitoring-jadwal-tanggal-pergantian-grid"
    }],
    load: function (g, b) {
        var f = this,
            a = f.down("antrian-monitoring-jadwal-tanggal-datepicker"),
            e = f.getViewModel(),
            d = (b) ? b : f.getSysdate();
        e.set("jadwal", g);
        a.loadJadwal({
            ID_JADWAL: g.get("ID"),
            BULAN: Ext.Date.format(d, "Y-m"),
            STATUS: 1
        })
    }
});
Ext.define("antrian.monitoring.jadwal.tanggal.Workspace", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-monitoring-jadwal-tanggal-workspace",
    onLoadTanggal: function (b) {
        var e = this,
            d = e.getViewModel(),
            a = e.getView();
        a.load(d.get("jadwal"), b)
    },
    onSelectTanggal: function (b, f) {
        var d = this,
            a = d.getReferences(),
            e = a.gridpengganti;
        if (f) {
            e.load({
                ID_TANGGAL: f.get("ID")
            })
        }
    }
});
Ext.define("antrian.monitoring.jadwal.tanggal.pergantian.Grid", {
    extend: "com.Grid",
    xtype: "antrian-monitoring-jadwal-tanggal-pergantian-grid",
    viewModel: {
        stores: {
            store: {
                type: "antrian-jadwal-pergantian-store"
            }
        }
    },
    hideHeaders: true,
    columns: [{
        flex: 1,
        dataIndex: "ID",
        xtype: "templatecolumn",
        tpl: new Ext.XTemplate('<div class="thumb-wrap">', '<div class="thumb">', '<div style="white-space:normal !important;"><b>Pengirim :</b> {[this.getPenerima(values)]}</div>', '<div style="white-space:normal !important;"><b>Penerima :</b> {[this.getPengirim(values)]}</div>', "</div>", "</div>", {
            getPenerima: function (b) {
                var a = b.REFERENSI ? b.REFERENSI.PERGANTIAN ? b.REFERENSI.PERGANTIAN : undefined : undefined,
                    a = a.REFERENSI ? a.REFERENSI.PENERIMA ? a.REFERENSI.PENERIMA : undefined : undefined;
                if (a) {
                    return a.NAMA + " (" + a.NIP + ")"
                }
                return ""
            },
            getPengirim: function (b) {
                var a = b.REFERENSI ? b.REFERENSI.PERGANTIAN ? b.REFERENSI.PERGANTIAN : undefined : undefined,
                    a = a.REFERENSI ? a.REFERENSI.PENGIRIM ? a.REFERENSI.PENGIRIM : undefined : undefined;
                if (a) {
                    return a.NAMA + " (" + a.NIP + ")"
                }
                return ""
            }
        })
    }, {
        text: "Status",
        dataIndex: "STATUS",
        menuDisabled: true,
        sortable: false,
        width: 100,
        align: "center",
        xtype: "templatecolumn",
        tpl: new Ext.XTemplate('<div class="thumb-wrap">', '<div class="thumb">', '<div style="color:white; padding:2px; border-radius:10px; background:{[this.deskColorStatus(values.STATUS)]}; white-space:normal;">{[this.deskStatus(values.STATUS)]}</div>', "</div>", "</div>", {
            deskStatus: function (b) {
                var a = ["Proses", "Terima", "Tolak"];
                return a[b]
            },
            deskColorStatus: function (b) {
                var a = ["#4f4d4d", "#2e8bfe", "#e76666"];
                return a[b]
            }
        })
    }]
});
Ext.define("antrian.monitoring.kemkes.jadwaldokter.Form", {
    extend: "com.Form",
    xtype: "antrian-monitoring-kemkes-jadwaldokter-form",
    controller: "antrian-monitoring-kemkes-jadwaldokter-form",
    layout: "hbox",
    defaults: {
        width: "30%",
        margin: "1.1.1.1"
    },
    items: [{
        xtype: "combo",
        fieldLabel: "Hari",
        labelAlign: "top",
        valueField: "ID",
        displayField: "DESK",
        reference: "hari",
        value: 1,
        name: "HARI",
        store: Ext.create("data.store.Store", {
            field: ["ID", "DESK"],
            data: [{
                ID: 0,
                DESK: "Minggu"
            }, {
                ID: 1,
                DESK: "Senin"
            }, {
                ID: 2,
                DESK: "Selasa"
            }, {
                ID: 3,
                DESK: "Rabu"
            }, {
                ID: 4,
                DESK: "Kamis"
            }, {
                ID: 5,
                DESK: "Jumat"
            }, {
                ID: 6,
                DESK: "Sabtu"
            }]
        }),
        listeners: {
            select: "onSelectHari"
        }
    }, {
        xtype: "ruangan-konsul-combo",
        name: "KLINIK",
        reference: "ruangan",
        fieldLabel: "Ruangan",
        params: {
            STATUS: 1
        },
        firstLoad: true,
        labelAlign: "top",
        listeners: {
            select: "onSelectRuangan"
        }
    }]
});
Ext.define("antrian.monitoring.kemkes.jadwaldokter.FormController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-monitoring-kemkes-jadwaldokter-form",
    onSelectHari: function (a, b) {
        this.filteJadwal(a)
    },
    onSelectRuangan: function (a, b) {
        this.filteJadwal(a)
    },
    privates: {
        filteJadwal: function (d) {
            var f = this,
                a = f.getView(),
                b = f.getReferences(),
                e = b.hari.getValue(),
                g = b.ruangan.getValue();
            if ((e) && (g)) {
                a.fireEvent("filter", {
                    HARI: e,
                    RUANGAN: g
                })
            }
        }
    }
});
Ext.define("antrian.monitoring.kemkes.jadwaldokter.Grid", {
    extend: "com.Grid",
    xtype: "antrian-monitoring-kemkes-jadwaldokter-grid",
    controller: "antrian-monitoring-kemkes-jadwaldokter-grid",
    viewModel: {
        stores: {
            store: {
                type: "antrian-monitoring-kemkes-jadwaldokter-store"
            }
        }
    },
    columns: [{
        xtype: "rownumberer",
        text: "No",
        align: "left",
        width: 50
    }, {
        xtype: "templatecolumn",
        text: "Dokter",
        flex: 1,
        tpl: new Ext.XTemplate('<div class="thumb-wrap">', '<div class="thumb">', '<div style="align : center; white-space:normal !important;">{REFERENSI.NAMA}</div>', "</div>", "</div>", {})
    }, {
        text: "Jam Kerja",
        flex: 1,
        columns: [{
            dataIndex: "JAM_MULAI",
            text: "Mulai"
        }, {
            dataIndex: "JAM_TUTUP",
            text: "Selesai"
        }, {
            text: "Kuota",
            dataIndex: "KUOTA"
        }]
    }, {
        xtype: "checkcolumn",
        text: "Status",
        dataIndex: "STATUS",
        width: 90,
        stopSelection: true,
        listeners: {
            checkchange: "onChange"
        }
    }]
});
Ext.define("antrian.monitoring.kemkes.jadwaldoter.GridController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-monitoring-kemkes-jadwaldokter-grid",
    onChange: function (o, a, l) {
        var m = this,
            j = m.getView(),
            n = m.getViewModel(),
            p = n.get("store"),
            k = p.getAt(a);
        k.set("STATUS", l ? 1 : 0);
        k.scope = this;
        k.save({
            callback: function (d, e, b) {
                if (b) {
                    j.notifyMessage("Status jadwal dokter di" + (l == true ? "Aktifkan" : "NonAktifkan"))
                } else {
                    k.set("STATUS", l ? 0 : 1)
                }
            }
        })
    }
});
Ext.define("antrian.monitoring.kemkes.jadwaldokter.Workspace", {
    extend: "com.Form",
    xtype: "antrian-monitoring-kemkes-jadwaldokter-workspace",
    controller: "antrian-monitoring-kemkes-jadwaldokter-workspace",
    layout: {
        type: "border"
    },
    defaults: {
        margin: "2.2.2.2"
    },
    initComponent: function () {
        var a = this;
        a.items = [{
            region: "north",
            height: 100,
            title: "Filter",
            ui: "panel-black",
            xtype: "antrian-monitoring-kemkes-jadwaldokter-form",
            listeners: {
                filter: "onFilterJadwalDokter"
            }
        }, {
            region: "center",
            flex: 1,
            title: "Jadwal Dokter",
            ui: "panel-black",
            xtype: "antrian-monitoring-kemkes-jadwaldokter-grid"
        }, {
            region: "west",
            flex: 1,
            title: "Dokter di ruangan",
            ui: "panel-black",
            xtype: "dokterruangan-list",
            listeners: {
                itemdblclick: "onItemDblClickPetugas"
            }
        }];
        a.callParent(arguments)
    },
    load: function () {
        var a = this,
            b = a.down("dokterruangan-list");
        b.getHeaderContainer().remove(3);
        b.setListConfig({
            paging: true
        })
    }
});
Ext.define("antrian.monitoring.kemkes.jadwaldokter.WorkspaceController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-monitoring-kemkes-jadwaldokter-workspace",
    filter: undefined,
    onFilterJadwalDokter: function (e) {
        var d = this,
            b = d.getView(),
            a = b.down("antrian-monitoring-kemkes-jadwaldokter-grid"),
            f = b.down("dokterruangan-list");
        d.filter = e;
        a.load({
            KLINIK: e.RUANGAN,
            HARI: e.HARI
        });
        f.load({
            RUANGAN: e.RUANGAN,
            STATUS: 1
        })
    },
    onItemDblClickPetugas: function (a, f) {
        var g = this,
            d = g.getViewModel(),
            e = g.filter;
        if (e) {
            model = Ext.create("antrian.monitoring.kemkes.jadwaldokter.Model", {
                KLINIK: e.RUANGAN,
                HARI: e.HARI,
                DOKTER: f.get("REFERENSI").DOKTER.NIP,
                STATUS: 1
            });
            g.simpanPetugas(model)
        }
    },
    privates: {
        simpanPetugas: function (g, a, h) {
            var j = this,
                e = j.getView();
            wind = e.openDialog("", true, 500, 100, {
                xtype: "com-form",
                ui: "panel-red",
                showCloseButton: true,
                hideColumns: true,
                title: "Jadwal",
                defaults: {
                    allowBlank: false,
                    width: "35%",
                    margin: "1.1.1.1"
                },
                layout: "hbox",
                items: [{
                    xtype: "timefield",
                    name: "MULAI",
                    format: "H:i:s",
                    emptyText: "[JAM MULAI]"
                }, {
                    xtype: "timefield",
                    name: "AKHIR",
                    format: "H:i:s",
                    emptyText: "[JAM AKHIR]"
                }, {
                    xtype: "numberfield",
                    name: "KUOTA",
                    width: "29%",
                    maxValue: 100,
                    hideTrigger: true,
                    emptyText: "[KUOTA]"
                }],
                buttons: [{
                    text: "Simpan",
                    iconCls: "x-fa fa-save",
                    listeners: {
                        click: function (b) {
                            var d = wind.down("com-form"),
                                f = d.getForm().getValues();
                            console.log(f);
                            if (d.getForm().isValid()) {
                                g.set("JAM_MULAI", f.MULAI);
                                g.set("JAM_TUTUP", f.AKHIR);
                                g.set("KUOTA", f.KUOTA);
                                g.showError = true;
                                g.save({
                                    callback: function (m, n, l) {
                                        if (l) {
                                            e.notifyMessage("Data telah tersimpan");
                                            j.loadPetugasPembagian();
                                            wind.close()
                                        }
                                    }
                                })
                            }
                        }
                    }
                }]
            })
        },
        loadPetugasPembagian: function () {
            var a = this;
            a.onFilterJadwalDokter(a.filter)
        }
    }
});
Ext.define("antrian.monitoring.kemkes.reservasi.Grid", {
    extend: "com.Grid",
    xtype: "antrian-monitoring-kemkes-reservasi-grid",
    controller: "antrian-monitoring-kemkes-reservasi-grid",
    viewModel: {
        stores: {
            store: {
                type: "antrian-monitoring-kemkes-reservasi-store"
            }
        },
        data: {
            tgltemp: undefined,
            tglSkrng: undefined,
            listConfig: {
                autoRefresh: true
            }
        },
        formulas: {
            autoRefreshIcon: function (a) {
                return a("listConfig.autoRefresh") ? "x-fa fa-stop" : "x-fa fa-play"
            },
            tooltipAutoRefresh: function (a) {
                return a("listConfig.autoRefresh") ? "Hentikan Perbarui Otomatis" : "Jalankan Perbarui Otomatis"
            }
        }
    },
    initComponent: function () {
        var a = this;
        a.createMenuContext();
        a.dockedItems = [{
            xtype: "toolbar",
            dock: "top",
            style: "background:#81d684;border:1px #CCC solid",
            items: [{
                ui: "soft-red",
                reference: "btnAntrian",
                text: "Antrian Online",
                hidden: true,
                tooltip: "Setting",
                listeners: {
                    click: "onToPendaftaranOnline"
                }
            }, {
                xtype: "button",
                ui: "soft-black",
                iconCls: "x-fa fa-cog",
                menu: [{
                    ui: "soft-blue",
                    iconCls: "x-fa fa-users",
                    tooltip: "Setting",
                    text: "Jadwal Dokter",
                    listeners: {
                        click: "onJadwalDokter"
                    }
                }]
            }, "->", {
                xtype: "datefield",
                name: "FTANGGAL",
                format: "d-m-Y",
                reference: "ftanggal",
                listeners: {
                    change: "onChangeTgl"
                }
            }, {
                xtype: "combo",
                reference: "combointerval",
                width: 75,
                store: {
                    fields: ["ID"],
                    data: [{
                        ID: 5
                    }, {
                        ID: 10
                    }, {
                        ID: 15
                    }, {
                        ID: 20
                    }, {
                        ID: 25
                    }, {
                        ID: 30
                    }]
                },
                editable: false,
                displayField: "ID",
                valueField: "ID",
                value: 15,
                bind: {
                    disabled: "{listConfig.autoRefresh}"
                }
            }, {
                xtype: "button",
                enableToggle: true,
                pressed: true,
                bind: {
                    iconCls: "{autoRefreshIcon}",
                    tooltip: "{tooltipAutoRefresh}"
                },
                toggleHandler: "onToggleRefresh"
            }]
        }, {
            xtype: "pagingtoolbar",
            bind: {
                store: "{store}"
            },
            dock: "bottom",
            displayInfo: true,
            items: ["-", {}, {}, {
                xtype: "search-field",
                cls: "x-text-border",
                autoFocus: true,
                emptyText: "Cari Nama Pasien",
                flex: 2,
                listeners: {
                    search: "onsearch",
                    clear: "onClear"
                }
            }, {
                xtype: "combobox",
                reference: "statusrespon",
                emptyText: "[ Filter Status ]",
                store: Ext.create("Ext.data.Store", {
                    fields: ["value", "desk"],
                    data: [{
                        value: "0",
                        desk: "Semua"
                    }, {
                        value: "1",
                        desk: "Belum Respon"
                    }, {
                        value: "2",
                        desk: "Sudah Respon"
                    }]
                }),
                queryMode: "local",
                displayField: "desk",
                flex: 1,
                valueField: "value",
                listeners: {
                    select: "onSelectStatus"
                }
            }]
        }];
        a.columns = [{
            text: "Nomor",
            dataIndex: "NOMOR",
            align: "left",
            flex: 0.3,
            renderer: "onAntrian"
        }, {
            text: "Poli Tujuan",
            dataIndex: "RUANGAN",
            align: "left",
            flex: 0.5,
            renderer: "onPoli"
        }, {
            text: "Dokter",
            dataIndex: "DOKTER",
            align: "left",
            flex: 0.5,
            renderer: "onDokterTujuan"
        }, {
            text: "Tgl. Kunjungan",
            align: "left",
            dataIndex: "TANGGAL_KUNJUGAN",
            flex: 0.5,
            renderer: "onTglK"
        }, {
            text: "Cara Bayar",
            align: "left",
            dataIndex: "PENJAMIN",
            flex: 0.5,
            renderer: "onCaraBayar"
        }, {
            text: "No RM",
            align: "left",
            dataIndex: "PASIEN",
            flex: 0.5,
            renderer: "onNorm"
        }, {
            text: "Nama",
            dataIndex: "NAMA",
            align: "left",
            renderer: "onRenderNama",
            flex: 0.5
        }, {
            text: "Tgl. Lahir",
            dataIndex: "TANGGAL_LAHIR",
            align: "left",
            renderer: "onRenderTgl",
            flex: 0.5
        }, {
            text: "Contact",
            align: "left",
            dataIndex: "KONTAK",
            flex: 0.5,
            renderer: "onCont"
        }, {
            text: "Jenis Pendaftar",
            align: "left",
            dataIndex: "JENIS",
            flex: 0.5,
            renderer: "onJenisPendaftaran"
        }, {
            text: "Res",
            xtype: "actioncolumn",
            align: "center",
            width: 50,
            items: [{
                xtype: "tool",
                iconCls: "x-fa fa-arrow-circle-right",
                tooltip: "Terima Kedatangan Pasien",
                handler: "onClickRespon"
            }]
        }];
        a.callParent(arguments)
    },
    listeners: {
        rowcontextmenu: "onKlikKananMenu"
    },
    createMenuContext: function () {
        var b = this;
        b.menucontext = new Ext.menu.Menu({
            items: [{
                text: "Terima Kedatangan Pasien",
                iconCls: "x-fa fa-arrow-circle-right",
                handler: function () {
                    b.getController().onRespon()
                }
            }, {
                text: "Refresh",
                glyph: "xf021@FontAwesome",
                handler: function () {
                    b.getController().onRefresh()
                }
            }]
        });
        return b.menucontext
    },
    loadData: function () {
        var f = this,
            b = f.down("[reference = btnAntrian]"),
            d = f.getViewModel(),
            j = webservice.app.xpriv,
            h = f.down("[reference=ftanggal]"),
            g = Ext.Date.format(d.get("tgltemp"), "d-m-Y"),
            e = Ext.Date.format(f.getSysdate(), "d-m-Y"),
            a = Ext.Date.format(f.getSysdate(), "Y-m-d");
        b.setHidden(!(j("900301", true) && j("900302", true)));
        if (g != e) {
            h.setValue(f.getSysdate());
            d.set("tgltemp", f.getSysdate())
        } else {
            f.reload()
        }
        d.set("tglSkrng", a)
    }
});
Ext.define("antrian.monitoring.kemkes.reservasi.GridController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-monitoring-kemkes-reservasi-grid",
    onToPendaftaranOnline: function () {
        var a = this.getView();
        a.fireEvent("changeActiveLayout", 1)
    },
    onsearch: function (j, g) {
        var h = this,
            a = h.getView(),
            d = h.getViewModel(),
            b = d.get("store");
        if (b) {
            b.removeAll();
            parameter = b.getQueryParams();
            b.setQueryParams({
                QUERY: g,
                TANGGAL_KUNJUNGAN: parameter.TANGGAL_KUNJUNGAN
            });
            b.load()
        }
    },
    onSelectStatus: function (b, g) {
        var f = this,
            e = f.getViewModel(),
            d = e.get("store");
        if (g.get("value") == "0") {
            delete d.queryParams.STATUS;
            d.removeAll()
        } else {
            d.removeAll();
            parameter = d.getQueryParams();
            d.setQueryParams({
                STATUS: g.get("value"),
                TANGGAL_KUNJUNGAN: parameter.TANGGAL_KUNJUNGAN,
                QUERY: parameter.QUERY
            })
        }
        d.load()
    },
    onClear: function () {
        var e = this,
            f = e.getViewModel(),
            a = f.get("store");
        delete a.queryParams.QUERY;
        a.removeAll();
        a.load()
    },
    onToggleRefresh: function (e, g) {
        var f = this,
            a = f.getView(),
            d = f.getReferences(),
            b = Number(d.combointerval.getValue()) * 1000;
        a.setListConfig({
            autoRefresh: e.pressed
        });
        if (e.pressed) {
            a.start(b)
        } else {
            a.stop()
        }
    },
    onJadwalDokter: function (b) {
        var d = this,
            a = d.getView();
        dialog = a.openDialog("", true, 0, 0, {
            xtype: "antrian-monitoring-kemkes-jadwaldokter-workspace",
            header: {
                iconCls: "x-fa fa-users",
                padding: "7px 7px 7px 7px",
                title: "Jadwal Dokter"
            },
            ui: "panel-cyan",
            showCloseButton: true,
            hideColumns: true
        }, function (f, g) {
            var e = g.down("antrian-monitoring-kemkes-jadwaldokter-workspace");
            e.load()
        })
    },
    onChangeTgl: function () {
        var d = this,
            a = d.getReferences(),
            e = a.ftanggal,
            b = {};
        obj = {
            TANGGAL_KUNJUNGAN: Ext.Date.format(e.getValue(), "Y-m-d")
        };
        d.getView().load(obj)
    },
    onPostAntrian: function (b, a, e) {
        var d = "Pos 1";
        this.setBackGround(a, e.get("STATUS"));
        return d
    },
    onDokterTujuan: function (b, a, e) {
        var d = e.get("REFERENSI") ? e.get("REFERENSI").NAMA : "";
        this.setBackGround(a, e.get("STATUS"));
        return d
    },
    onJenisPendaftaran: function (b, a, e) {
        var d = (b == 2) ? "Pasien Lama" : "Pasien Baru";
        this.setBackGround(a, e.get("STATUS"));
        return d
    },
    onRenderJenis: function (b, a, e) {
        var d = e.get("JENIS") == 1 ? "Pasien Lama" : "Pasien Baru";
        this.setBackGround(a, e.get("STATUS"));
        return d
    },
    onRenderNama: function (b, a, e) {
        var d = e.get("NAMA");
        this.setBackGround(a, e.get("STATUS"));
        return d
    },
    onAntrian: function (b, a, d) {
        this.setBackGround(a, d.get("STATUS"));
        return b
    },
    onPoli: function (d, b, e) {
        var a = e.get("REFERENSI").RUANGAN.DESKRIPSI;
        this.setBackGround(b, e.get("STATUS"));
        return a
    },
    onTglK: function (b, a, d) {
        this.setBackGround(a, d.get("STATUS"));
        return Ext.Date.format(d.get("TANGGAL_KUNJUNGAN"), "Y-m-d")
    },
    onCaraBayar: function (b, a, d) {
        this.setBackGround(a, d.get("STATUS"));
        return b
    },
    onNorm: function (d, b, e) {
        var a = d == 0 ? "" : d;
        this.setBackGround(b, e.get("STATUS"));
        return a
    },
    onCont: function (b, a, d) {
        this.setBackGround(a, d.get("STATUS"));
        return b
    },
    onRenderTgl: function (b, a, e) {
        var d = Ext.Date.format(b, "Y-m-d H:i:s");
        this.setBackGround(a, e.get("STATUS"));
        return d
    },
    setBackGround: function (b, a) {
        if (a == 2) {
            b.style = "background-color:#0df775;color:#000000;font-weight: bold"
        }
    },
    onKlikKananMenu: function (e, j, n, k, l) {
        var o = this,
            m = l.getXY();
        l.stopEvent();
        o.getView().menucontext.showAt(m)
    },
    onClickRespon: function (d, g, b) {
        var e = this,
            a = e.getView(),
            f = d.getStore().getAt(g);
        if (f.get("STATUS") == 1) {
            e.onResponPasien(f)
        } else {
            a.notifyMessage("Data Sudah Di Respon")
        }
    },
    onResponPasien: function (f) {
        var d = this,
            a = d.getView(),
            b = d.getViewModel().get("tglSkrng"),
            e = Ext.Date.format(f.get("TANGGAL_KUNJUNGAN"), "Y-m-d"),
            g = f.get("JENIS") == 2 ? "Terima kedatangan pasien norm " + f.get("PASIEN") + " - " + f.get("NAMA") + "?" : "Terima kedatangan pasien dengan nama " + f.get("NAMA") + " ?";
        if (b === e) {
            Ext.Msg.show({
                title: "Respon Pasien",
                message: g,
                buttons: Ext.Msg.YESNO,
                icon: Ext.Msg.QUESTION,
                animateTarget: f,
                fn: function (h) {
                    if (h === "yes") {
                        f.set("STATUS", 2);
                        f.save({
                            callback: function (k, j, l) {
                                if (l) {
                                    a.notifyMessage("Data Berhasil Di Respon");
                                    f.set("NORM", f.get("PASIEN"));
                                    a.fireEvent("openpasien", f, f.get("JENIS") == 2)
                                } else {
                                    a.notifyMessage("Data Gagal Di Respon")
                                }
                            }
                        })
                    }
                }
            })
        } else {
            a.notifyMessage("Pasien Belum Bisa Di Daftar, Hanya tanggal Kunjungan Hari ini yang dapat direspon")
        }
    },
    onRespon: function () {
        var a = this,
            b = a.getView().getSelection()[0];
        a.onResponPasien(b)
    },
    onRefresh: function () {
        var a = this.getView();
        a.reload()
    }
});
Ext.define("antrian.monitoring.pengaturan.Form", {
    extend: "com.Form",
    xtype: "antrian-monitoring-pengaturan-form",
    requires: ["Ext.picker.Time"],
    controller: "antrian-monitoring-pengaturan-form",
    viewModel: {
        stores: {
            storesCekDuplikat: {
                type: "antrian-pengaturan-store",
                queryParams: {
                    STATUS: 1,
                    start: 0,
                    limit: 1
                }
            }
        },
        data: {
            isNewForm: true
        }
    },
    layout: {
        type: "hbox"
    },
    model: "antrian.pengaturan.Model",
    initComponent: function () {
        var a = this;
        a.items = [{
            xtype: "antrian-combo-pos-antrian",
            name: "POS_ANTRIAN",
            firstLoad: true,
            reference: "fpos",
            allowBlank: false,
            margin: "0 10 0 0",
            flex: 1
        }, {
            xtype: "numberfield",
            emptyText: "[ Limit ]",
            name: "LIMIT_DAFTAR",
            flex: 1,
            allowBlank: false,
            hideTrigger: true,
            margin: "0 10 0 0"
        }, {
            xtype: "numberfield",
            emptyText: "[ Batas Maksimal Hari ]",
            name: "BATAS_MAX_HARI",
            flex: 1,
            allowBlank: false,
            hideTrigger: true,
            margin: "0 10 0 0"
        }, {
            xtype: "numberfield",
            emptyText: "[ Batas Maksimal Hari Mobile JKN ]",
            name: "BATAS_MAX_HARI_BPJS",
            flex: 1,
            allowBlank: false,
            hideTrigger: true,
            margin: "0 10 0 0"
        }, {
            xtype: "numberfield",
            emptyText: "[ Durasi Layanan (menit) ]",
            name: "DURASI",
            allowBlank: false,
            flex: 1,
            margin: "0 10 0 0"
        }, {
            name: "MULAI",
            reference: "mulai",
            flex: 0.5,
            xtype: "timefield",
            emptyText: "[Jam:Mnt:Dtk]",
            format: "H:i:s",
            hideTrigger: true,
            margin: "0 10 0 0"
        }, {
            xtype: "button",
            text: "Simpan",
            ui: "soft-blue",
            handler: "onSimpan"
        }];
        a.callParent(arguments)
    },
    onLoadRecord: function (e) {
        var d = this,
            b = d.down("[name=MULAI]"),
            a = d.getSysdate();
        b.setValue(a)
    },
    isDuplikcatDataEntry: function (e) {
        var b = this,
            a = b.getViewModel().get("storesCekDuplikat");
        if (a) {
            var d = b.down("antrian-combo-pos-antrian").getValue();
            a.queryParams.POS_ANTRIAN = d;
            a.load(function (g, f, h) {
                if (Ext.isArray(g)) {
                    e(g.length > 0)
                }
            })
        }
    }
});
Ext.define("antrian.monitoring.pengaturan.FormController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-monitoring-pengaturan-form",
    onSimpan: function (b) {
        var d = this,
            a = d.getView();
        a.isDuplikcatDataEntry(function (f) {
            if (f) {
                var e = d.getViewModel().get("storesCekDuplikat"),
                    g = e.getAt(0);
                g.set("STATUS", 0);
                g.save({
                    callback: function (h, j, k) {
                        if (k) {
                            a.save(b)
                        } else {
                            a.notifyMessage("Gagal")
                        }
                    }
                })
            } else {
                a.save(b)
            }
        })
    }
});
Ext.define("antrian.monitoring.pengaturan.List", {
    extend: "com.Grid",
    alias: "widget.antrian-monitoring-pengaturan-list",
    controller: "antrian-monitoring-pengaturan-list",
    viewModel: {
        stores: {
            store: {
                type: "antrian-pengaturan-store"
            }
        }
    },
    cls: "x-br-top",
    border: true,
    initComponent: function () {
        var a = this;
        a.columns = [{
            xtype: "rownumberer",
            text: "No",
            align: "left",
            width: 40
        }, {
            dataIndex: "POS_ANTRIAN",
            text: "POS",
            width: 70,
            renderer: "onRenderPos"
        }, {
            dataIndex: "LIMIT_DAFTAR",
            text: "Limit",
            flex: 1,
            renderer: "onRenderLimit"
        }, {
            dataIndex: "BATAS_MAX_HARI",
            text: "Maksimal Hari Pendaftaran",
            flex: 1,
            renderer: "onRenderLimitHari"
        }, {
            dataIndex: "BATAS_MAX_HARI_BPJS",
            text: "Maksimal Hari Pendaftaran Mobile JKN",
            flex: 1,
            renderer: "onRenderLimitHariMobileJkn"
        }, {
            dataIndex: "TANGGALKUNJUNGAN",
            text: "Durasi",
            flex: 1,
            renderer: "onRenderDurasi"
        }, {
            xtype: "datecolumn",
            dataIndex: "MULAI",
            text: "Jam Mulai Layanan",
            flex: 1,
            format: "H:i:s",
            renderer: "onRenderMulai"
        }], a.dockedItems = [{
            xtype: "pagingtoolbar",
            bind: {
                store: "{store}"
            },
            dock: "bottom",
            displayInfo: true
        }];
        a.callParent(arguments)
    },
    onLoadRecord: function () {
        var b = this,
            a = b.getViewModel().get("store");
        a.load()
    }
});
Ext.define("antrian.monitoring.pengaturan.ListController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-monitoring-pengaturan-list",
    onRenderPos: function (b, a, d) {
        var e = d.get("POS_ANTRIAN");
        this.setBackGround(a, d.get("STATUS"));
        return e
    },
    onRenderLimit: function (d, b, e) {
        var a = e.get("LIMIT_DAFTAR");
        this.setBackGround(b, e.get("STATUS"));
        return a
    },
    onRenderLimitHari: function (d, b, e) {
        var a = e.get("BATAS_MAX_HARI");
        this.setBackGround(b, e.get("STATUS"));
        return a
    },
    onRenderLimitHariMobileJkn: function (d, b, e) {
        var a = e.get("BATAS_MAX_HARI_BPJS");
        this.setBackGround(b, e.get("STATUS"));
        return a
    },
    onRenderDurasi: function (b, a, e) {
        var d = e.get("DURASI");
        this.setBackGround(a, e.get("STATUS"));
        return d
    },
    onRenderMulai: function (d, b, e) {
        var a = Ext.Date.format(e.get("MULAI"), "H:i:s");
        this.setBackGround(b, e.get("STATUS"));
        return a
    },
    setBackGround: function (b, a) {
        if (a == 1) {
            b.style = "background-color:#0df775;color:#000000;font-weight: bold"
        }
    }
});
Ext.define("antrian.monitoring.pengaturan.Workspace", {
    extend: "com.Form",
    xtype: "antrian-monitoring-pengaturan-workspace",
    controller: "antrian-monitoring-pengaturan-workspace",
    layout: {
        type: "hbox",
        align: "stretch"
    },
    flex: 1,
    initComponent: function () {
        var a = this;
        a.items = [{
            flex: 1,
            layout: "border",
            items: [{
                region: "north",
                border: true,
                xtype: "antrian-monitoring-pengaturan-form",
                reference: "formpengaturanregistrasi",
                listeners: {
                    save: "onSuccess"
                }
            }, {
                region: "center",
                xtype: "antrian-monitoring-pengaturan-list",
                reference: "listpengaturanregistrasi",
                header: {
                    iconCls: "x-fa fa-list",
                    padding: "7px 7px 7px 7px",
                    title: "Detail"
                }
            }]
        }];
        a.callParent(arguments)
    },
    load: function () {
        var a = this;
        form = a.down("antrian-monitoring-pengaturan-form");
        list = a.down("antrian-monitoring-pengaturan-list");
        form.createRecord({});
        list.onLoadRecord()
    }
});
Ext.define("antrian.monitoring.pengaturan.WorkspaceController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-monitoring-pengaturan-workspace",
    onSuccess: function (d, g, b) {
        var f = this,
            a = f.getView(),
            e = f.getViewModel();
        a.load()
    }
});
Ext.define("antrian.monitoring.posantrian.List", {
    extend: "com.Grid",
    alias: "widget.antrian-monitoring-posantrian-list",
    controller: "antrian-monitoring-posantrian-list",
    viewModel: {
        stores: {
            store: {
                type: "antrian-posantrian-store",
                queryParams: {}
            }
        }
    },
    checkboxModel: false,
    posAntrianAkses: true,
    initComponent: function () {
        var a = this;
        a.columns = [{
            xtype: "rownumberer",
            text: "No",
            align: "left",
            width: 60,
            hidden: a.checkboxModel
        }, {
            text: a.posAntrianAkses ? "Ruangan Akses" : "Ruangan",
            flex: 1,
            dataIndex: "DESKRIPSI",
            renderer: "onRenderer"
        }, {
            text: "Status",
            flex: 1,
            hidden: a.posAntrianAkses,
            dataIndex: "STATUS",
            renderer: "onStatus"
        }];
        a.callParent(arguments)
    },
    doAfterLoad: function (g, h, j, a) {
        var e = this,
            b = e.getSelectionModel();
        if (Ext.isArray(h)) {
            if (h.length > 0) {
                for (var d = 0; d < h.length; d++) {
                    if (b) {
                        if (e.checkboxModel) {
                            var f = h[d].get("checked") ? (h[d].get("checked") == 1) : false;
                            if (f) {
                                b.select(h[d], true)
                            }
                        }
                    }
                }
            }(new Ext.util.DelayedTask(function () {})).delay(100)
        }
    }
});
Ext.define("antrian.monitoring.posantrian.ListController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-monitoring-posantrian-list",
    onRenderer: function (a, k, b, j) {
        var f = this,
            h = f.getView(),
            e = a.length,
            g = ((b.get("JENIS") - 1) * 10),
            d = h.getSelectionModel();
        return h.ruanganAkses ? Ext.String.leftPad(a, e + g, "&nbsp;") : a
    },
    onStatus: function (g, d, f, a) {
        var b = this,
            e = (f.get("STATUS") == 1) ? "Aktif" : "Non Aktif";
        if (f.get("STATUS") == 1) {
            return '<span style="color:green;">' + e + "</span>"
        } else {
            return '<span style="color:red;">' + e + "</span>"
        }
    }
});
Ext.define("antrian.monitoring.ruangan.List", {
    extend: "com.Grid",
    alias: "widget.antrian-monitoring-ruangan-list",
    controller: "antrian-monitoring-ruangan-list",
    viewModel: {
        stores: {
            store: {
                type: "antrian-ruangan-store",
                autoSync: true
            }
        },
        data: {
            validasiAntrianPerRuangan: true
        }
    },
    ui: "panel-cyan",
    initComponent: function () {
        var a = this;
        a.cellEditing = new Ext.grid.plugin.CellEditing({
            clicksToEdit: 1,
            listeners: {
                beforeedit: "BeforeEdit"
            }
        });
        a.plugins = [a.cellEditing], a.columns = [{
            xtype: "rownumberer",
            text: "No",
            align: "left",
            width: 60
        }, {
            text: "Ruangan / Poliklinik",
            flex: 1,
            dataIndex: "DESKRIPSI"
        }, {
            text: "Pos Antrian",
            width: 100,
            dataIndex: "ANTRIAN",
            renderer: "onRenderPos",
            editor: {
                xtype: "antrian-combo-pos-antrian",
                name: "ANTRIAN",
                firstLoad: true
            }
        }, {
            text: "Limit / Kouta",
            width: 100,
            dataIndex: "LIMIT_DAFTAR",
            renderer: "onRenderLimit",
            bind: {
                hidden: "{validasiAntrianPerRuangan}"
            },
            editor: {
                xtype: "numberfield",
                name: "LIMIT_DAFTAR",
                firstLoad: true
            }
        }, {
            text: "Durasi Pendaftaran (menit)",
            width: 100,
            dataIndex: "DURASI_PENDAFTARAN",
            renderer: "onRenderDurasi",
            bind: {
                hidden: "{validasiAntrianPerRuangan}"
            },
            editor: {
                xtype: "numberfield",
                name: "DURASI_PENDAFTARAN",
                firstLoad: true
            }
        }, {
            text: "Durasi Pelayanan (menit)",
            width: 100,
            dataIndex: "DURASI_PELAYANAN",
            renderer: "onRenderDurasiPelayanan",
            bind: {
                hidden: "{validasiAntrianPerRuangan}"
            },
            editor: {
                xtype: "numberfield",
                name: "DURASI_PELAYANAN",
                firstLoad: true
            }
        }, {
            text: "Jam Mulai",
            width: 100,
            dataIndex: "MULAI",
            renderer: "onRenderMulai",
            bind: {
                hidden: "{validasiAntrianPerRuangan}"
            },
            editor: {
                xtype: "timefield",
                name: "MULAI",
                format: "H:i:s",
                firstLoad: true,
                hideTrigger: true
            }
        }, {
            text: "JUMLAH_MEJA",
            width: 100,
            dataIndex: "JUMLAH_MEJA",
            renderer: "onRenderJmlMeja",
            bind: {
                hidden: "{validasiAntrianPerRuangan}"
            },
            editor: {
                xtype: "numberfield",
                name: "JUMLAH_MEJA",
                firstLoad: true
            }
        }, {
            text: "Proporsi Pasien JKN (%)",
            width: 100,
            dataIndex: "PERSENTASE_KOUTA",
            renderer: "onRenderPersentaseKouta",
            bind: {
                hidden: "{validasiAntrianPerRuangan}"
            },
            editor: {
                xtype: "numberfield",
                hideTrigger: true,
                name: "PERSENTASE_KOUTA",
                firstLoad: true
            }
        }, {
            text: "Proporsi Pasien Non JKN (%)",
            width: 100,
            dataIndex: "PERSENTASE_KOUTA_NON_JKN",
            renderer: "onRenderPersentaseKoutaNonJkn",
            bind: {
                hidden: "{validasiAntrianPerRuangan}"
            },
            editor: {
                xtype: "numberfield",
                hideTrigger: true,
                name: "PERSENTASE_KOUTA_NON_JKN",
                firstLoad: true
            }
        }], a.dockedItems = [{
            xtype: "pagingtoolbar",
            bind: {
                store: "{store}"
            },
            dock: "bottom",
            displayInfo: true
        }];
        a.callParent(arguments)
    },
    onLoadRecord: function () {
        var d = this,
            b = d.getViewModel(),
            a = d.getViewModel().get("store");
        if (d.getPropertyConfig("33") == "TRUE") {
            b.set("validasiAntrianPerRuangan", false)
        } else {
            b.set("validasiAntrianPerRuangan", true)
        }
        a.load()
    }
});
Ext.define("antrian.monitoring.ruangan.ListController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-monitoring-ruangan-list",
    currentRecord: undefined,
    BeforeEdit: function (b, f, a) {
        var d = this;
        d.currentRecord = f.record
    },
    onSelectPos: function (e, d) {
        var f = this;
        f.currentRecord = d
    },
    onSimpan: function (d) {
        var e = this,
            b = e.getStore("store"),
            f = b.getModifiedRecords(),
            a = 0;
        Ext.Array.each(f, function (g) {
            g.save({
                callback: function (h, j, k) {
                    if (k) {
                        if (a === (f.length - 1)) {
                            e.getView().notifyMessage("Data telah disimpan")
                        }
                    }
                    a++
                }
            })
        })
    },
    onRefresh: function (b) {
        var d = this,
            a = d.getView();
        a.refresh()
    },
    onStatusCheck: function (d, f, b) {
        var e = this,
            g = f ? 1 : 0,
            a = d.getWidgetRecord();
        if (a) {
            if (a.get("STATUS") === g) {
                return
            }
            a.set("STATUS", g);
            a.save({
                callback: function (h, j, k) {
                    if (k) {
                        e.getView().notifyMessage("Data telah disimpan")
                    }
                }
            })
        }
    },
    onRenderPos: function (e, b, d) {
        var a = d.get("ANTRIAN");
        return a
    },
    onRenderLimit: function (e, b, d) {
        var a = d.get("LIMIT_DAFTAR");
        return a
    },
    onRenderDurasi: function (e, b, d) {
        var a = d.get("DURASI_PENDAFTARAN");
        return a
    },
    onRenderDurasiPelayanan: function (e, b, d) {
        var a = d.get("DURASI_PELAYANAN");
        return a
    },
    onRenderMulai: function (e, b, d) {
        var a = Ext.Date.format(d.get("MULAI"), "H:i:s");
        return a
    },
    onRenderJmlMeja: function (e, b, d) {
        var a = d.get("JUMLAH_MEJA");
        return a
    },
    onRenderPersentaseKouta: function (e, b, d) {
        var a = d.get("PERSENTASE_KOUTA");
        return a
    },
    onRenderPersentaseKoutaNonJkn: function (e, b, d) {
        var a = d.get("PERSENTASE_KOUTA_NON_JKN");
        return a
    },
    onRuanganCombo: function (a, e) {
        var d = this.getView().getSelection();
        if (e) {
            if (Ext.isArray(d)) {
                if (d.length > 0) {
                    var b = d[0].get("REFERENSI") || {};
                    b.RUANGAN_RS = e.data;
                    d[0].set("REFERENSI", b)
                }
            }
        }
    },
    onRuanganRenderer: function (f, d, b) {
        var e = b.get("REFERENSI"),
            a = e ? e.RUANGAN_RS : null;
        if (a) {
            return a.DESKRIPSI
        }
        return f
    }
});
Ext.define("antrian.monitoring.ruangan.Workspace", {
    extend: "com.Form",
    xtype: "antrian-monitoring-ruangan-workspace",
    bodyPadding: 2,
    layout: {
        type: "hbox",
        align: "stretch"
    },
    flex: 1,
    initComponent: function () {
        var a = this;
        a.items = [{
            xtype: "antrian-monitoring-ruangan-list",
            flex: 1,
            reference: "listmonitoringruangan",
            header: {
                iconCls: "x-fa fa-list",
                padding: "7px 7px 7px 7px",
                title: "Daftar Pos Antrian Ruangan"
            }
        }];
        a.callParent(arguments)
    },
    onLoadRecord: function (d) {
        var a = this,
            b = a.down("antrian-monitoring-ruangan-list");
        b.onLoadRecord({})
    }
});
Ext.define("antrian.onsite.CaraBayar", {
    extend: "com.Form",
    alias: "widget.antrian-onsite-carabayar",
    layout: {
        type: "vbox",
        align: "middle",
        pack: "center"
    },
    initComponent: function () {
        var a = this;
        a.items = [{
            layout: {
                type: "vbox",
                pack: "center"
            },
            width: 750,
            height: 400,
            items: [{
                xtype: "component",
                margin: "0 0 20 0",
                style: "font-size:18px;padding:15px;background:#D8F1EC;width:100%",
                html: "* Ambil Antrian Berdasarkan Jaminan *"
            }, {
                xtype: "button",
                style: "border-radius:10px",
                html: '<b style="font-size:32px">BPJS / JKN</b>',
                ui: "soft-blue",
                margin: "0 0 20 0",
                width: "100%",
                height: 100,
                scale: "large",
                handler: "onPasienBpjs"
            }, {
                xtype: "button",
                style: "border-radius:10px",
                html: '<b style="font-size:32px">UMUM / CORPORATE</b>',
                ui: "soft-green",
                width: "100%",
                height: 100,
                scale: "large",
                handler: "onPasienNonBpjs"
            }]
        }];
        a.callParent(arguments)
    }
});
Ext.define("antrian.onsite.Farmasi", {
    extend: "com.Form",
    alias: "widget.antrian-onsite-farmasi",
    layout: {
        type: "vbox",
        align: "middle",
        pack: "center"
    },
    initComponent: function () {
        var a = this;
        a.items = [{
            layout: {
                type: "vbox",
                pack: "center"
            },
            width: 750,
            height: 400,
            items: [{
                xtype: "component",
                margin: "0 0 20 0",
                style: "font-size:18px;padding:15px;background:#D8F1EC;width:100%",
                html: "* Ambil Antrian Berdasarkan Jenis Resep *"
            }, {
                xtype: "button",
                style: "border-radius:10px",
                html: '<b style="font-size:32px">Racikan</b>',
                ui: "soft-blue",
                margin: "0 0 20 0",
                width: "100%",
                height: 100,
                scale: "large",
                handler: "onAntrianRacikan"
            }, {
                xtype: "button",
                style: "border-radius:10px",
                html: '<b style="font-size:32px">Non Racik</b>',
                ui: "soft-green",
                width: "100%",
                height: 100,
                scale: "large",
                handler: "onAntrianNonRacik"
            }]
        }];
        a.callParent(arguments)
    }
});
Ext.define("antrian.onsite.List", {
    extend: "com.Grid",
    xtype: "antrian-onsite-list",
    controller: "antrian-onsite-list",
    viewModel: {
        stores: {
            store: {
                type: "antrian-posantrian-store"
            }
        }
    },
    initComponent: function () {
        var a = this;
        a.columns = [{
            text: "Pos Antrian",
            flex: 1,
            dataIndex: "DESKRIPSI"
        }, {
            text: "Cara Bayar",
            xtype: "actioncolumn",
            align: "center",
            width: 150,
            items: [{
                xtype: "tool",
                iconCls: "x-fa fa-arrow-circle-right",
                tooltip: "View Display Ambil Antrian",
                handler: "onViewDisplayCaraBayar"
            }]
        }, {
            text: "Ruangan",
            xtype: "actioncolumn",
            align: "center",
            width: 150,
            items: [{
                xtype: "tool",
                iconCls: "x-fa fa-arrow-circle-right",
                tooltip: "View Display Ambil Antrian",
                handler: "onViewDisplayRuangan"
            }]
        }, {
            text: "Jenis",
            xtype: "actioncolumn",
            align: "center",
            width: 150,
            items: [{
                xtype: "tool",
                iconCls: "x-fa fa-arrow-circle-right",
                tooltip: "View Display Ambil Antrian",
                handler: "onViewDisplayJenis"
            }]
        }, {
            text: "Obat / Resep",
            xtype: "actioncolumn",
            align: "center",
            width: 150,
            items: [{
                xtype: "tool",
                iconCls: "x-fa fa-arrow-circle-right",
                tooltip: "View Display Ambil Antrian",
                handler: "onViewDisplayFarmasi"
            }]
        }, {
            text: "V2",
            xtype: "actioncolumn",
            align: "center",
            width: 150,
            items: [{
                xtype: "tool",
                iconCls: "x-fa fa-arrow-circle-right",
                tooltip: "View Display Ambil Antrian V2",
                handler: "onViewAntrianV2"
            }]
        }];
        a.callParent(arguments)
    },
    onLoadRecord: function (d) {
        var b = this,
            a = b.getViewModel().get("store");
        a.setQueryParams({
            STATUS: 1
        });
        a.load()
    }
});
Ext.define("antrian.onsite.ListController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-onsite-list",
    onViewDisplayCaraBayar: function (d, g, b) {
        var e = this,
            a = e.getView(),
            f = d.getStore().getAt(g);
        if (f) {
            a.openDialog("", true, "100%", "100%", {
                xtype: "antrian-onsite-workspace",
                ui: "panel-cyan",
                title: "Ambil Antrian",
                scrollable: false
            }, function (k, j) {
                var h = j.down("antrian-onsite-workspace");
                h.onLoadRecord(f, "CB")
            }, e, true, false)
        } else {
            a.notifyMessage("Record Not Found")
        }
    },
    onViewDisplayRuangan: function (d, g, b) {
        var e = this,
            a = e.getView(),
            f = d.getStore().getAt(g);
        if (f) {
            a.openDialog("", true, "100%", "100%", {
                xtype: "antrian-onsite-workspace",
                ui: "panel-cyan",
                title: "Ambil Antrian",
                scrollable: false
            }, function (k, j) {
                var h = j.down("antrian-onsite-workspace");
                h.onLoadRecord(f, "RUANGAN")
            }, e, true, false)
        } else {
            a.notifyMessage("Record Not Found")
        }
    },
    onViewDisplayJenis: function (d, g, b) {
        var e = this,
            a = e.getView(),
            f = d.getStore().getAt(g);
        if (f) {
            a.openDialog("", true, "100%", "100%", {
                xtype: "antrian-onsite-workspace",
                ui: "panel-cyan",
                title: "Ambil Antrian",
                scrollable: false
            }, function (k, j) {
                var h = j.down("antrian-onsite-workspace");
                h.onLoadRecord(f, "JENIS")
            }, e, true, false)
        } else {
            a.notifyMessage("Record Not Found")
        }
    },
    onViewDisplayFarmasi: function (d, g, b) {
        var e = this,
            a = e.getView(),
            f = d.getStore().getAt(g);
        if (f) {
            a.openDialog("", true, "100%", "100%", {
                xtype: "antrian-onsite-workspace",
                ui: "panel-cyan",
                title: "Ambil Antrian",
                scrollable: false
            }, function (k, j) {
                var h = j.down("antrian-onsite-workspace");
                h.onLoadRecord(f, "FARMASI")
            }, e, true, false)
        } else {
            a.notifyMessage("Record Not Found")
        }
    },
    onViewAntrianV2: function (d, g, b) {
        var e = this,
            a = e.getView(),
            f = d.getStore().getAt(g);
        if (f) {
            a.openDialog("", true, "100%", "100%", {
                xtype: "antrian-onsite-v2-workspace",
                ui: "panel-cyan",
                title: "Ambil Antrian",
                scrollable: false
            }, function (k, j) {
                var h = j.down("antrian-onsite-v2-workspace");
                h.onLoadRecord(f)
            }, e, true, false)
        } else {
            a.notifyMessage("Record Not Found")
        }
    }
});
Ext.define("antrian.onsite.V2.Baru.Form", {
    extend: "com.Form",
    alias: "widget.antrian-onsite-v2-baru-form",
    layout: {
        type: "vbox",
        align: "stretch"
    },
    model: "antrian.reservasi.Model",
    defaultType: "textfield",
    fieldDefaults: {
        labelAlign: "top",
        fieldStyle: "font-size:16px;font-weight:bold"
    },
    items: [{
        name: "NIK",
        reference: "nik",
        emptyText: "NIK",
        fieldLabel: "NIK Pasien",
        allowBlank: false,
        height: 70,
        hideTrigger: true,
        margin: "0 0 20 0"
    }, {
        name: "NAMA",
        reference: "nama",
        emptyText: "Nama",
        fieldLabel: "Nama Pasien",
        allowBlank: false,
        height: 70,
        hideTrigger: true,
        margin: "0 0 20 0"
    }, {
        xtype: "fieldcontainer",
        layout: "hbox",
        defaultType: "textfield",
        items: [{
            name: "TEMPAT_LAHIR",
            reference: "tmplahir",
            emptyText: "Tempat Lahir",
            fieldLabel: "Tempat Lahir",
            allowBlank: false,
            height: 70,
            flex: 1,
            margin: "0 10 20 0"
        }, {
            xtype: "datefield",
            name: "TANGGAL_LAHIR",
            reference: "tgllahirnew",
            fieldLabel: "Tanggal Lahir",
            height: 70,
            flex: 1,
            format: "Y-m-d",
            emptyText: "Tanggal Lahir",
            allowBlank: false,
            margin: "0 0 20 0"
        }]
    }, {
        name: "KONTAK",
        reference: "kontak",
        emptyText: "No.Telepon / HP",
        fieldLabel: "Kontak Pasien",
        allowBlank: false,
        height: 70,
        hideTrigger: true,
        margin: "0 0 45 0"
    }, {
        text: "Lanjut",
        xtype: "button",
        margin: "0 0 20 0",
        iconCls: "x-fa fa-arrow-right",
        reference: "btndoformnew",
        scale: "large",
        iconAlign: "right",
        ui: "soft-blue",
        handler: "onNextNew"
    }],
    onLoadRecord: function (a) {
        var f = this,
            e = f.down("[reference=nik]"),
            h = f.down("[reference=nama]"),
            g = f.down("[reference=kontak]"),
            d = f.down("[reference=tmplahir]"),
            b = f.down("[reference=tgllahirnew]");
        e.setValue("");
        h.setValue("");
        g.setValue("");
        d.setValue("");
        b.setValue("");
        f.focus("NIK")
    }
});
Ext.define("antrian.onsite.V2.Form", {
    extend: "com.Tab",
    alias: "widget.antrian-onsite-v2-form",
    controller: "antrian-onsite-v2-form",
    viewModel: {
        stores: {
            storepsn: {
                type: "antrian-pasien-store"
            }
        },
        data: {
            posAntrian: undefined
        }
    },
    activeTab: 0,
    cls: "x-br-top",
    ui: "header-tab",
    tabBar: {
        layout: {
            pack: "center"
        },
        border: false
    },
    initComponent: function () {
        var a = this;
        a.items = [{
            title: "<div id='psn1' style='color:black;font-weight:bold;font-size:16px'>Pasien Lama</div>",
            bodyPadding: 50,
            reference: "formpasienlama",
            xtype: "antrian-onsite-v2-lama-form"
        }, {
            title: "<div id='psn2' style='color:black;font-weight:bold;font-size:16px'>Pasien Baru</div>",
            bodyPadding: 50,
            reference: "formpasienbaru",
            xtype: "antrian-onsite-v2-baru-form"
        }];
        a.callParent(arguments)
    },
    loadStore: function (d) {
        var b = this,
            a = this.getActiveTab();
        b.rec = d;
        if (a) {
            a.onLoadRecord({})
        } else {
            if (b.items.getCount() > 0) {
                b.setActiveTab(0)
            }
        }
    },
    onLoadRecord: function (a) {
        var b = this;
        psnlama = b.down("[reference=formpasienlama]"), psnbaru = b.down("[reference=formpasienbaru]");
        psnlama.createRecord({
            POS_ANTRIAN: a.get("NOMOR")
        });
        psnbaru.createRecord({
            POS_ANTRIAN: a.get("NOMOR")
        });
        psnlama.focus("NORM");
        b.getViewModel().set("posAntrian", a.get("NOMOR"))
    },
    listeners: {
        tabchange: "onTabChange"
    }
});
Ext.define("antrian.onsite.V2.FormController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-onsite-v2-form",
    onTabChange: function (d, a) {
        var b = this,
            e = b.getView().getViewModel().get("posAntrian");
        if (a.load) {
            a.createRecord({
                POS_ANTRIAN: e
            })
        }
    },
    onRefresh: function (a) {
        var d = this;
        d.getView().load({})
    },
    onNextOld: function (d) {
        var e = this;
        view = e.getView(), ref = e.getReferences(), store = view.getViewModel().get("storepsn"), rec = ref.formpasienlama.getRecord();
        if (rec) {
            var a = rec.get("NORM"),
                b = a.toString();
            if (b.length == 16) {
                store.queryParams = {
                    NIK: rec.get("NORM"),
                    TANGGAL_LAHIR: Ext.Date.format(rec.get("TANGGAL_LAHIR"), "Y-m-d")
                }
            } else {
                store.queryParams = {
                    NORM: rec.get("NORM"),
                    TANGGAL_LAHIR: Ext.Date.format(rec.get("TANGGAL_LAHIR"), "Y-m-d")
                }
            }
            view.setLoading(true);
            store.load({
                callback: function (h, g, j) {
                    if (j) {
                        var f = {
                            NORM: h[0].get("NORM"),
                            NAMA: h[0].get("NAMA"),
                            TEMPAT_LAHIR: h[0].get("REFERENSI") ? (h[0].get("REFERENSI").TEMPATLAHIR ? h[0].get("REFERENSI").TEMPATLAHIR.DESKRIPSI : "-") : "-",
                            TANGGAL_LAHIR: h[0].get("TANGGAL_LAHIR"),
                            JENIS_KELAMIN: h[0].get("JENIS_KELAMIN"),
                            ALAMAT: h[0].get("ALAMAT"),
                            NIK: h[0].get("KARTUIDENTITAS") ? h[0].get("KARTUIDENTITAS")[0].NOMOR : "0",
                            NO_KARTU_BPJS: h[0].get("NO_KARTU_BPJS") ? h[0].get("NO_KARTU_BPJS") : "",
                            JENIS: 1,
                            POS_ANTRIAN: rec.get("POS_ANTRIAN"),
                            TANGGALKUNJUNGAN: Ext.Date.format(view.getSysdate(), "Y-m-d"),
                            JENIS_APLIKASI: 33,
                            CONTACT: h[0].get("KONTAK") ? h[0].get("KONTAK")[0].NOMOR : "0"
                        };
                        e.showWindow(d, f, "Registrasi Antrian Pasien Lama");
                        view.setLoading(false)
                    } else {
                        e.getView().notifyMessage("Data Identitas Pasien tidak ditemukan", "danger-red")
                    }
                    view.setLoading(false)
                }
            })
        } else {
            e.getView().notifyMessage("Silahkan lengkapi data", "danger-red")
        }
    },
    onNextNew: function (b) {
        var d = this;
        view = d.getView(), ref = d.getReferences(), rec = ref.formpasienbaru.getRecord();
        if (rec) {
            view.setLoading(true);
            var a = {
                NORM: rec.get("NORM"),
                NAMA: rec.get("NAMA"),
                TEMPAT_LAHIR: rec.get("TEMPAT_LAHIR"),
                TANGGAL_LAHIR: rec.get("TANGGAL_LAHIR"),
                JENIS_KELAMIN: "",
                ALAMAT: "",
                NIK: rec.get("NIK"),
                NO_KARTU_BPJS: "",
                JENIS: 2,
                POS_ANTRIAN: rec.get("POS_ANTRIAN"),
                TANGGALKUNJUNGAN: Ext.Date.format(view.getSysdate(), "Y-m-d"),
                JENIS_APLIKASI: 33,
                CONTACT: rec.get("KONTAK")
            };
            d.showWindow(b, a, "Registrasi Antrian Pasien Baru");
            view.setLoading(false)
        } else {
            d.getView().notifyMessage("Silahkan lengkapi data", "danger-red")
        }
    },
    privates: {
        showWindow: function (d, b, f) {
            var e = this,
                a = e.getView();
            a.openDialog("", true, "100%", "100%", {
                title: f,
                xtype: "antrian-onsite-v2-registrasi-workspace",
                ui: "panel-cyan",
                hideHeaders: false,
                scrollable: true,
                showCloseButton: true
            }, function (j, h) {
                var g = h.down("antrian-onsite-v2-registrasi-workspace");
                g.onLoadRecord(b);
                g.on("success", function (k) {
                    e.onSetNewAntrian();
                    h.close()
                })
            }, d, true, true)
        }
    },
    onSetNewAntrian: function () {
        var e = this,
            b = e.getReferences(),
            a = e.getView().getViewModel().get("posAntrian"),
            f = b.formpasienlama,
            d = b.formpasienbaru;
        f.createRecord({
            POS_ANTRIAN: a
        });
        d.createRecord({
            POS_ANTRIAN: a
        });
        f.focus("NORM")
    }
});
Ext.define("antrian.onsite.V2.Lama.Form", {
    extend: "com.Form",
    alias: "widget.antrian-onsite-v2-lama-form",
    layout: {
        type: "vbox",
        align: "stretch"
    },
    model: "antrian.reservasi.Model",
    defaultType: "textfield",
    fieldDefaults: {
        labelAlign: "top",
        fieldStyle: "font-size:16px;font-weight:bold"
    },
    items: [{
        name: "NORM",
        reference: "norm",
        emptyText: "No. Rekam Medis / NIK",
        fieldLabel: "No. Rekam Medis / NIK",
        allowBlank: false,
        height: 70,
        hideTrigger: true,
        margin: "0 0 20 0"
    }, {
        xtype: "datefield",
        name: "TANGGAL_LAHIR",
        reference: "tgllahirold",
        fieldLabel: "Tanggal Lahir",
        height: 70,
        format: "Y-m-d",
        emptyText: "Tanggal Lahir",
        allowBlank: false,
        margin: "0 0 45 0"
    }, {
        text: "Lanjut",
        xtype: "button",
        margin: "0 0 20 0",
        iconCls: "x-fa fa-arrow-right",
        reference: "btndoformold",
        scale: "large",
        iconAlign: "right",
        ui: "soft-blue",
        handler: "onNextOld"
    }],
    onLoadRecord: function (a) {
        var e = this,
            d = e.down("[reference=norm]"),
            b = e.down("[reference=tgllahirold]");
        d.setValue("");
        b.setValue("");
        e.focus("NORM")
    }
});
Ext.define("antrian.onsite.V2.Registrasi.Bukti", {
    extend: "com.Form",
    alias: "widget.antrian-onsite-v2-registrasi-bukti",
    controller: "antrian-onsite-v2-registrasi-bukti",
    viewModel: {
        data: {
            recordantrian: undefined
        }
    },
    layout: {
        type: "vbox",
        align: "stretch"
    },
    bodyPadding: 40,
    fieldDefaults: {
        fieldStyle: "font-size:16px;font-style:italic",
        labelStyle: "font-size:16px;font-style:italic"
    },
    items: [{
        style: "padding:10px;font-size:20px;border-bottom:1px #DDD solid;text-left:center;font-style:italic;color:teal;background-color:teal;",
        bodyStyle: "background-color:transparent;color:#FFF;font-size:20px;text-align:center",
        html: "PROSES PENGAMBILAN ANTRIAN BERHASIL",
        margin: "0 0 20 0"
    }, {
        xtype: "displayfield",
        reference: "kodeantrian",
        fieldLabel: "Kode Antrian",
        height: 30,
        labelWidth: 200,
        margin: "0 0 20 0"
    }, {
        xtype: "displayfield",
        reference: "noantrian",
        fieldLabel: "No. Antrian",
        height: 30,
        labelWidth: 200,
        margin: "0 0 20 0"
    }, {
        xtype: "displayfield",
        reference: "namapasien",
        fieldLabel: "Nama Pasien",
        height: 30,
        labelWidth: 200,
        margin: "0 0 20 0"
    }, {
        xtype: "displayfield",
        reference: "politujuan",
        fieldLabel: "Poliklinik Tujuan",
        height: 30,
        labelWidth: 200,
        margin: "0 0 20 0",
        readOnly: true
    }, {
        xtype: "displayfield",
        reference: "dokter",
        fieldLabel: "Dokter",
        height: 30,
        labelWidth: 200,
        margin: "0 0 20 0",
        readOnly: true
    }, {
        text: "PRINT / CETAK",
        xtype: "button",
        margin: "0 0 20 0",
        iconCls: "x-fa fa-print",
        scale: "large",
        iconAlign: "right",
        ui: "soft-blue",
        handler: "onCetak"
    }],
    onSetData: function (f) {
        var h = this,
            g = h.down("[reference=kodeantrian]"),
            b = h.down("[reference=noantrian]"),
            a = h.down("[reference=namapasien]"),
            e = h.down("[reference=politujuan]"),
            d = h.down("[reference=dokter]");
        h.getViewModel().set("recordantrian", f);
        g.setValue("");
        b.setValue("");
        a.setValue("");
        e.setValue("");
        d.setValue("");
        g.setValue(f.kodebooking);
        b.setValue(f.nomorantrean);
        a.setValue(f.nama);
        e.setValue(f.namapoli);
        d.setValue(f.namadokter)
    }
});
Ext.define("antrian.onsite.V2.Registrasi.BuktiController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-onsite-v2-registrasi-bukti",
    onCetak: function (b) {
        var d = this,
            a = d.getView(),
            e = a.getViewModel().get("recordantrian");
        a.cetak({
            TITLE: "Cetak Antrian",
            NAME: "plugins.antrian.online.CetakKarcisAntrian",
            TYPE: "Word",
            EXT: "docx",
            PARAMETER: {
                PNOMOR: e.kodebooking
            },
            REQUEST_FOR_PRINT: true,
            PRINT_NAME: "CetakAntrian"
        });
        a.setLoading(false);
        d.onProgressClick(b)
    },
    onProgressClick: function (d) {
        var f = this,
            a = f.getView(),
            b = 0,
            e, g;
        Ext.MessageBox.show({
            title: "Sedang Proses",
            msg: "Proses Cetak...",
            progressText: "Initializing...",
            width: 300,
            progress: true,
            closable: false,
            animateTarget: d
        });
        e = function () {
            f.timer = null;
            ++b;
            if (b === 12 || !Ext.MessageBox.isVisible()) {
                Ext.MessageBox.hide();
                a.fireEvent("success")
            } else {
                g = b / 11;
                Ext.MessageBox.updateProgress(g, Math.round(100 * g) + "% completed");
                f.timer = Ext.defer(e, 500)
            }
        };
        f.timer = Ext.defer(e, 500)
    }
});
Ext.define("antrian.onsite.V2.Registrasi.Detail", {
    extend: "com.Form",
    alias: "widget.antrian-onsite-v2-registrasi-detail",
    model: "antrian.reservasi.Model",
    layout: {
        type: "vbox",
        align: "stretch"
    },
    bodyPadding: 30,
    fieldDefaults: {
        fieldStyle: "font-size:16px;color:teal;font-style:italic",
        labelStyle: "font-size:16px;color:teal;font-style:italic"
    },
    items: [{
        style: "padding:10px;font-size:20px;border-bottom:1px #DDD solid;text-left:center;font-style:italic;color:teal;background-color:#A5C8D1;",
        bodyStyle: "background-color:transparent;color:teal;font-size:20px;",
        html: "IDENTITAS PASIEN"
    }, {
        name: "TANGGALKUNJUNGAN",
        reference: "tanggalkunjungan",
        allowBlank: false,
        xtype: "datefield",
        format: "Y-m-d",
        hidden: true
    }, {
        xtype: "hiddenfield",
        name: "POS_ANTRIAN",
        reference: "posantrian",
        allowBlank: false
    }, {
        xtype: "textfield",
        name: "NORM",
        reference: "norm",
        fieldLabel: "No. Rekam Medis",
        allowBlank: false,
        height: 40,
        labelWidth: 150,
        margin: "30 0 20 0",
        readOnly: true
    }, {
        xtype: "textfield",
        name: "NAMA",
        reference: "norm",
        fieldLabel: "Nama",
        allowBlank: false,
        height: 40,
        labelWidth: 150,
        margin: "0 0 20 0",
        readOnly: true
    }, {
        xtype: "fieldcontainer",
        fieldLabel: "Tempat / Tgl.Lahir",
        labelWidth: 150,
        labelStyle: "font-size:16px;color:teal;font-style:italic",
        layout: "hbox",
        margin: "0 0 20 0",
        combineErrors: true,
        defaultType: "textfield",
        defaults: {
            hideLabel: "true"
        },
        items: [{
            name: "TEMPAT_LAHIR",
            reference: "norm",
            allowBlank: false,
            fieldStyle: "font-size:16px;color:teal;font-style:italic",
            height: 40,
            flex: 3,
            margin: "0 10 0 0"
        }, {
            name: "TANGGAL_LAHIR",
            reference: "norm",
            xtype: "datefield",
            format: "Y-m-d",
            allowBlank: false,
            fieldStyle: "font-size:16px;color:teal;font-style:italic",
            height: 40,
            flex: 2,
            readOnly: true
        }]
    }, {
        xtype: "textfield",
        name: "NIK",
        reference: "nik",
        fieldLabel: "NIK",
        allowBlank: false,
        height: 40,
        labelWidth: 150,
        margin: "0 0 20 0"
    }, {
        xtype: "textfield",
        name: "CONTACT",
        reference: "kontak",
        fieldLabel: "Kontak Pasien",
        height: 40,
        labelWidth: 150,
        margin: "0 0 20 0"
    }, {
        xtype: "container",
        style: "background-color:#A5C8D1;",
        flex: 1
    }, {
        style: "padding:10px;font-size:14px;border-top:1px #DDD solid;text-left:center;font-style:italic;color:red;background-color:#A5C8D1;",
        bodyStyle: "background-color:transparent;color:red",
        html: "Ket : Sebelum Ambil ANTRIAN, Pastikan data yang tampil sudah sesuai"
    }],
    onLoadRecord: function (b, a) {},
    getNik: function () {
        var b = this,
            a = b.down("[reference=nik]").getValue();
        return a
    }
});
Ext.define("antrian.onsite.V2.Registrasi.Form", {
    extend: "com.Form",
    alias: "widget.antrian-onsite-v2-registrasi-form",
    viewModel: {
        data: {
            isPilihPoli: true,
            isSimpanAntrian: true,
            isSelectJaminan: true,
            isAntrianJkn: true
        }
    },
    layout: {
        type: "vbox",
        align: "stretch"
    },
    bodyPadding: 20,
    model: "antrian.reservasi.Model",
    fieldDefaults: {
        labelAlign: "top",
        fieldStyle: "font-size:18px;font-weight:bold;background:powderblue;color:#000",
        labelStyle: "font-size:16px"
    },
    items: [{
        name: "CARABAYAR",
        xtype: "antrian-combo-carabayar",
        reference: "jeniscarabayar",
        emptyText: "[ Filter Penjamin / Cara Bayar]",
        allowBlank: false,
        height: 54,
        margin: "0 0 20 0",
        firstLoad: true,
        params: {
            STATUS: 1
        },
        listeners: {
            select: "onSelectCaraBayar",
            blur: "onBlurCaraBayar"
        }
    }, {
        xtype: "fieldcontainer",
        layout: "hbox",
        defaultType: "textfield",
        items: [{
            name: "NO_KARTU_BPJS",
            reference: "nokartu",
            emptyText: "No. Kartu Jaminan JKN / BPJS",
            fieldStyle: "font-size:18px;font-weight:bold;",
            height: 54,
            flex: 1,
            margin: "0 10 18 0",
            bind: {
                disabled: "{isAntrianJkn}"
            }
        }, {
            name: "NO_REF_BPJS",
            reference: "norujukan",
            emptyText: "Masukkan No. Rujukan",
            format: "Y-m-d",
            fieldStyle: "font-size:18px;font-weight:bold;",
            margin: "0 10 18 0",
            height: 54,
            flex: 1,
            disabled: true
        }, {
            text: "Rujukan Faskes 1",
            xtype: "button",
            margin: "0 0 18 0",
            iconCls: "x-fa fa-search",
            reference: "btnrujukanlainnya",
            iconAlign: "right",
            height: 54,
            ui: "soft-cyan",
            handler: "onRujukanLainnya",
            bind: {
                disabled: "{isAntrianJkn}"
            }
        }, {
            text: "Rujukan Faskes 2",
            xtype: "button",
            margin: "0 0 18 0",
            iconCls: "x-fa fa-search",
            reference: "btnrujukanlainnya",
            iconAlign: "right",
            height: 54,
            ui: "soft-cyan",
            handler: "onRujukanLainnya2",
            bind: {
                disabled: "{isAntrianJkn}"
            }
        }, {
            text: "Kontrol / SPRI",
            xtype: "button",
            margin: "0 0 18 0",
            iconCls: "x-fa fa-list",
            reference: "btnkontrol",
            iconAlign: "right",
            height: 54,
            handler: "onSuratKontrol",
            bind: {
                disabled: "{isAntrianJkn}"
            }
        }]
    }, {
        xtype: "antrian-combo-poli",
        name: "POLI",
        reference: "poli",
        allowBlank: false,
        height: 54,
        margin: "0 0 20 0",
        firstLoad: true,
        params: {
            STATUS: 1,
            ANTRIAN: "-"
        },
        bind: {
            disabled: "{isSelectJaminan}"
        },
        listeners: {
            select: "onSelectPoli",
            blur: "onBlurPoli"
        }
    }, {
        xtype: "antrian-combo-jadwal-dokter",
        name: "DOKTER",
        reference: "dokter",
        allowBlank: false,
        height: 54,
        margin: "0 0 40 0",
        params: {
            STATUS: 1,
            POLI: "-"
        },
        bind: {
            disabled: "{isPilihPoli}"
        },
        listeners: {
            select: "onSelectDokter",
            blur: "onBlurDokter"
        }
    }, {
        text: "Ambil Antrian",
        xtype: "button",
        margin: "0 0 20 0",
        iconCls: "x-fa fa-print",
        reference: "btndoantrian",
        scale: "large",
        iconAlign: "right",
        ui: "soft-green",
        handler: "onAmbilAntrian",
        bind: {
            disabled: "{isSimpanAntrian}"
        }
    }],
    onLoadRecord: function (d, b) {
        var d = this,
            a = d.down("antrian-combo-poli");
        a.params.ANTRIAN = b.get("POS_ANTRIAN");
        a.load()
    },
    onSetDokter: function (a) {
        var d = this,
            b = d.down("antrian-combo-jadwal-dokter");
        b.params.TANGGAL = Ext.Date.format(d.getSysdate(), "Y-m-d");
        b.params.POLI = a.get("REFERENSI").PENJAMIN.RUANGAN_PENJAMIN;
        b.load({
            callback: function (f, e, g) {
                if (g) {
                    if (f.length == 0) {
                        d.notifyMessage("Poliklinik Tersebut belum memiliki jadwal Dokter Hari Ini", "danger-red")
                    }
                } else {
                    d.notifyMessage("Poliklinik Tersebut belum memiliki jadwal Dokter Hari Ini", "danger-red")
                }
            }
        })
    },
    onBeforeGetRecord: function (b, e) {
        var d = b.down("antrian-combo-poli").getSelection(),
            a = b.down("antrian-combo-jadwal-dokter").getSelection(),
            f = b.down("[reference=norujukan]").getValue();
        e.REFERENSI = {
            DESKRIPSI: {
                KETERANGAN: "Ambil Antrian"
            }
        };
        e.NO_REF_BPJS = f;
        e.POLI_BPJS = d.data.REFERENSI.PENJAMIN ? d.data.REFERENSI.PENJAMIN.RUANGAN_PENJAMIN : "0";
        e.JAM_PRAKTEK = a.data.JAM
    },
    getNokartu: function () {
        var b = this,
            a = b.down("[reference=nokartu]").getValue();
        return a
    },
    onResetForm: function () {
        var d = this,
            a = d.down("antrian-combo-poli"),
            b = d.down("antrian-combo-poli"),
            e = d.down("[reference=norujukan]");
        e.setValue("");
        b.removeDataStore();
        delete a.getStore().queryParams.RUANGAN_PENJAMIN;
        a.load();
        a.select(null)
    },
    isNullMappingPoli: function (a, e) {
        console.log(a);
        var d = this,
            b = d.down("antrian-combo-poli");
        norujukan = d.down("[reference=norujukan]");
        b.select(null);
        b.params.RUANGAN_PENJAMIN = a.poliRujukan.kode;
        b.load(function (g, f, h) {
            if (Ext.isArray(g)) {
                if (g.length > 0) {
                    b.setSelection(g[0]);
                    norujukan.setValue(a.noKunjungan)
                }
                e(g.length == 0)
            }
        })
    },
    isNullMappingPoliKontrol: function (a, e) {
        console.log(a);
        var d = this,
            b = d.down("antrian-combo-poli");
        norujukan = d.down("[reference=norujukan]");
        b.select(null);
        b.params.RUANGAN_PENJAMIN = a.poliTujuan;
        b.load(function (g, f, h) {
            if (Ext.isArray(g)) {
                if (g.length > 0) {
                    b.setSelection(g[0]);
                    norujukan.setValue(a.noSuratKontrol)
                }
                e(g.length == 0)
            }
        })
    }
});
Ext.define("antrian.onsite.V2.Registrasi.Info", {
    extend: "com.Form",
    alias: "widget.antrian-onsite-v2-registrasi-info",
    controller: "antrian-onsite-v2-registrasi-info",
    layout: {
        type: "vbox",
        align: "stretch"
    },
    bodyPadding: 50,
    fieldDefaults: {
        fieldStyle: "font-size:16px;color:teal;font-style:italic",
        labelStyle: "font-size:16px;color:teal;font-style:italic"
    },
    items: [{
        style: "padding:10px;font-size:20px;border-bottom:1px #DDD solid;text-left:center;font-style:italic;color:teal;background-color:#A5C8D1;",
        bodyStyle: "background-color:transparent;color:teal;font-size:20px;text-align:center",
        html: "INFORMASI DATA RUJUKAN",
        margin: "0 0 20 0"
    }, {
        xtype: "textfield",
        reference: "norujukan",
        fieldLabel: "No. Rujukan",
        height: 40,
        labelWidth: 200,
        margin: "0 0 20 0",
        readOnly: true
    }, {
        xtype: "textfield",
        reference: "faskesasal",
        fieldLabel: "Faskes Asal Rujukan",
        height: 40,
        labelWidth: 200,
        margin: "0 0 20 0",
        readOnly: true
    }, {
        xtype: "textfield",
        reference: "politujuan",
        fieldLabel: "Poliklinik Tujuan",
        height: 40,
        labelWidth: 200,
        margin: "0 0 20 0",
        readOnly: true
    }, {
        text: "LANJUT DAFTAR",
        xtype: "button",
        margin: "0 0 20 0",
        iconCls: "x-fa fa-arrow-right",
        scale: "large",
        iconAlign: "right",
        ui: "soft-blue",
        handler: "onLanjutAntrian"
    }],
    onSetData: function (b) {
        var f = this,
            e = f.down("[reference=norujukan]"),
            d = f.down("[reference=faskesasal]"),
            a = f.down("[reference=politujuan]");
        e.setValue("");
        d.setValue("");
        a.setValue("");
        e.setValue(b.noKunjungan);
        d.setValue(b.provPerujuk.nama);
        a.setValue(b.poliRujukan.nama + " (" + b.poliRujukan.kode + ")")
    },
    onSetDataKontrol: function (b) {
        var f = this,
            e = f.down("[reference=norujukan]"),
            d = f.down("[reference=faskesasal]"),
            a = f.down("[reference=politujuan]");
        e.setValue("");
        d.setValue("");
        a.setValue("");
        e.setValue(b.noSuratKontrol);
        d.setValue(b.namaJnsKontrol + " | " + b.jnsPelayanan);
        a.setValue(b.namaPoliTujuan + " (" + b.poliTujuan + ")")
    }
});
Ext.define("antrian.onsite.V2.Registrasi.InfoController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-onsite-v2-registrasi-info",
    onLanjutAntrian: function (b) {
        var d = this,
            a = d.getView();
        a.fireEvent("success")
    }
});
Ext.define("antrian.onsite.V2.Registrasi.Kontrol", {
    extend: "com.Grid",
    xtype: "antrian-onsite-v2-registrasi-kontrol",
    controller: "antrian-onsite-v2-registrasi-kontrol",
    viewModel: {
        stores: {
            store: {
                type: "plugins-bpjs-rujukan-store"
            }
        }
    },
    bind: {
        store: "{store}"
    },
    columns: [{
        text: "Peserta",
        flex: 1,
        columns: [{
            xtype: "templatecolumn",
            text: "No. Kartu",
            flex: 1,
            sortable: false,
            align: "center",
            tpl: "{noKartu}"
        }, {
            xtype: "templatecolumn",
            text: "Nama",
            flex: 1,
            sortable: false,
            align: "left",
            tpl: "{nama}"
        }]
    }, {
        text: "Rencana Kontrol",
        flex: 1,
        columns: [{
            text: "Poli Tujuan",
            flex: 1,
            dataIndex: "namaPoliTujuan",
            sortable: false,
            align: "center"
        }, {
            xtype: "datecolumn",
            format: "d-m-Y",
            flex: 1,
            text: "Tgl. Kunjungan",
            dataIndex: "tglRencanaKontrol",
            sortable: false,
            align: "center"
        }]
    }, {
        xtype: "templatecolumn",
        text: "Nama Dokter",
        flex: 1,
        sortable: false,
        align: "left",
        tpl: "{namaDokter}"
    }, {
        xtype: "widgetcolumn",
        align: "center",
        text: "Pilih Surat Kontrol",
        widget: {
            xtype: "fieldcontainer",
            defaults: {
                padding: 2
            },
            items: [{
                xtype: "button",
                text: "Pilih & Daftar",
                ui: "soft-green",
                margin: "0 1 0 0",
                tooltip: "Gunakan Data Surat Kontrol Ini",
                handler: "onPilihKontrol"
            }]
        }
    }],
    onSetData: function (a) {
        var e = this,
            d = e.getViewModel().get("store");
        for (i = 0; i < a.length; i++) {
            var b = Ext.create("plugins.bpjs.rujukan.Model", a[i]);
            d.add(b)
        }
    }
});
Ext.define("antrian.onsite.V2.Registrasi.KontrolController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-onsite-v2-registrasi-kontrol",
    onPilihKontrol: function (e) {
        var b = this,
            a = b.getView(),
            d = e.ownerCt.getWidgetRecord();
        a.fireEvent("success", d)
    }
});
Ext.define("antrian.onsite.V2.Registrasi.Rujukan", {
    extend: "com.Grid",
    xtype: "antrian-onsite-v2-registrasi-rujukan",
    controller: "antrian-onsite-v2-registrasi-rujukan",
    viewModel: {
        stores: {
            store: {
                type: "plugins-bpjs-rujukan-store"
            }
        }
    },
    bind: {
        store: "{store}"
    },
    columns: [{
        text: "Kunjungan",
        flex: 1,
        columns: [{
            text: "No. Kunjungan",
            flex: 1,
            dataIndex: "noKunjungan",
            sortable: false,
            align: "center"
        }, {
            xtype: "datecolumn",
            format: "d-m-Y",
            flex: 1,
            text: "Tgl. Kunjungan",
            dataIndex: "tglKunjungan",
            sortable: false,
            align: "center"
        }]
    }, {
        text: "Peserta",
        flex: 1,
        columns: [{
            xtype: "templatecolumn",
            text: "No. Kartu",
            flex: 1,
            sortable: false,
            align: "center",
            tpl: "{peserta.noKartu}"
        }, {
            xtype: "templatecolumn",
            text: "No. RM",
            flex: 1,
            sortable: false,
            align: "center",
            tpl: "{peserta.mr.noMR}"
        }, {
            xtype: "templatecolumn",
            text: "Nama",
            flex: 1,
            sortable: false,
            tpl: "{peserta.nama}"
        }]
    }, {
        text: "Diagnosa",
        flex: 1,
        columns: [{
            xtype: "templatecolumn",
            text: "Kode",
            sortable: false,
            align: "center",
            tpl: "{diagnosa.kode}"
        }, {
            xtype: "templatecolumn",
            text: "Nama",
            sortable: false,
            tpl: "{diagnosa.nama}"
        }]
    }, {
        text: "Poli Rujukan",
        flex: 1,
        columns: [{
            xtype: "templatecolumn",
            text: "Kode",
            sortable: false,
            flex: 1,
            align: "center",
            tpl: "{poliRujukan.kode}"
        }, {
            xtype: "templatecolumn",
            text: "Nama",
            sortable: false,
            flex: 1,
            tpl: "{poliRujukan.nama}"
        }]
    }, {
        text: "Perujuk",
        flex: 1,
        columns: [{
            xtype: "templatecolumn",
            text: "Kode",
            sortable: false,
            align: "center",
            flex: 1,
            tpl: "{provPerujuk.kode}"
        }, {
            xtype: "templatecolumn",
            text: "Nama",
            flex: 1,
            sortable: false,
            tpl: "{provPerujuk.nama}"
        }]
    }, {
        xtype: "widgetcolumn",
        align: "center",
        text: "Pilih Rujukan",
        widget: {
            xtype: "fieldcontainer",
            defaults: {
                padding: 2
            },
            items: [{
                xtype: "button",
                text: "Pilih & Daftar",
                ui: "soft-green",
                margin: "0 1 0 0",
                tooltip: "Pilih Data Rujukan Ini",
                handler: "onPilihRujukan"
            }]
        }
    }],
    onSetData: function (a) {
        var e = this,
            d = e.getViewModel().get("store");
        for (i = 0; i < a.length; i++) {
            var b = Ext.create("plugins.bpjs.rujukan.Model", a[i]);
            d.add(b)
        }
    }
});
Ext.define("antrian.onsite.V2.Registrasi.RujukanController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-onsite-v2-registrasi-rujukan",
    onPilihRujukan: function (e) {
        var b = this,
            a = b.getView(),
            d = e.ownerCt.getWidgetRecord();
        a.fireEvent("success", d)
    }
});
Ext.define("antrian.onsite.V2.Registrasi.Workspace", {
    extend: "com.Form",
    alias: "widget.antrian-onsite-v2-registrasi-workspace",
    controller: "antrian-onsite-v2-registrasi-workspace",
    layout: {
        type: "hbox",
        align: "stretch"
    },
    bodyPadding: 0,
    items: [{
        xtype: "antrian-onsite-v2-registrasi-detail",
        bodyStyle: "background-color:rgb(165, 200, 209)",
        reference: "formdetailantrian",
        margin: "0 10 0 0",
        flex: 2
    }, {
        xtype: "antrian-onsite-v2-registrasi-form",
        reference: "formantrian",
        margin: "0 0 0 10",
        flex: 3
    }],
    onLoadRecord: function (a) {
        var e = this,
            b = e.down("antrian-onsite-v2-registrasi-detail"),
            d = e.down("antrian-onsite-v2-registrasi-form");
        b.createRecord(a);
        d.createRecord(a)
    }
});
Ext.define("antrian.onsite.V2.Registrasi.WorkspaceController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-onsite-v2-registrasi-workspace",
    recordRujukan: undefined,
    recordJenisKunjungan: 1,
    init: function () {
        var b = this,
            a = b.getView();
        b.integrasi = a.app.xitr("ID", 1);
        if (b.integrasi) {
            b.service = Ext.create(b.integrasi.NAMA_KLAS, {})
        }
        b.serviceantrian = Ext.create("antrian.Service", {})
    },
    showNotif: function (g, e, d) {
        var b = this,
            a = Ext.create("Ext.window.MessageBox", {
                ui: d ? d : "window-red",
                title: g,
                header: {
                    padding: 5
                }
            }),
            f = {
                msg: e,
                buttons: Ext.MessageBox.OK,
                scope: b.scope,
                icon: Ext.Msg.ERROR
            };
        a.show(f)
    },
    isValidNik: function (a) {
        if (a.length != 16) {
            return "NIK Harus 16 Digit / karakter"
        }
        if (a == "") {
            return "NIK Harus Di Terisi"
        }
        return false
    },
    isValidNoKartu: function (a) {
        if (a.length != 13) {
            return "No.Kartu Jaminan JKN / BPJS Harus 13 Digit / karakter"
        }
        if (a == "") {
            return "No.Kartu Jaminan JKN / BPJS Harus Di Terisi"
        }
        return false
    },
    onSelectCaraBayar: function (d, a) {
        var e = this,
            b = e.getReferences();
        b.formantrian.getViewModel().set("isAntrianJkn", true);
        if (a) {
            if (a.get("ID") == 2) {
                b.formantrian.getViewModel().set("isAntrianJkn", false);
                b.formantrian.focus("NO_KARTU_BPJS");
                b.formantrian.getViewModel().set("isSelectJaminan", true);
                b.formantrian.getViewModel().set("isPilihPoli", true)
            } else {
                b.formantrian.onResetForm();
                b.formantrian.focus("POLI");
                b.formantrian.getViewModel().set("isPilihPoli", true);
                b.formantrian.getViewModel().set("isSelectJaminan", false)
            }
        } else {
            b.formantrian.onResetForm();
            b.formantrian.getViewModel().set("isPilihPoli", true);
            b.formantrian.getViewModel().set("isSelectJaminan", true)
        }
    },
    onBlurCaraBayar: function (a) {
        if (a.getSelection() == null) {
            this.onSelectPoli(a, null)
        }
    },
    onSelectPoli: function (d, a) {
        var e = this,
            b = e.getReferences();
        b.formantrian.getViewModel().set("isPilihPoli", true);
        if (a) {
            if (a.get("REFERENSI")) {
                if (a.get("REFERENSI").PENJAMIN) {
                    if (a.get("REFERENSI").PENJAMIN.BPJS) {
                        b.formantrian.getViewModel().set("isPilihPoli", false);
                        b.formantrian.onSetDokter(a)
                    } else {
                        e.getView().notifyMessage("Poliklinik tersebut belum memiliki penjamin", "danger-red")
                    }
                } else {
                    e.getView().notifyMessage("Poliklinik tersebut belum memiliki penjamin", "danger-red")
                }
            } else {
                e.getView().notifyMessage("Poliklinik tersebut belum memiliki penjamin", "danger-red")
            }
        }
    },
    onBlurPoli: function (a) {
        if (a.getSelection() == null) {
            this.onSelectPoli(a, null);
            a.setSelection(null)
        }
    },
    onSelectDokter: function (d, a) {
        var e = this,
            b = e.getReferences();
        b.formantrian.getViewModel().set("isSimpanAntrian", true);
        if (a) {
            b.formantrian.getViewModel().set("isSimpanAntrian", false)
        }
    },
    onBlurDokter: function (a) {
        if (a.getSelection() == null) {
            this.onSelectDokter(a, null)
        }
    },
    onCariRujukan: function (h) {
        var j = this,
            f = j.getReferences(),
            a = j.getView(),
            g = f.formdetailantrian.getNik(),
            e = f.formantrian.getNokartu(),
            d = j.isValidNik(g),
            b = j.isValidNoKartu(e);
        if (d) {
            j.getView().notifyMessage(d, "danger-red");
            return false
        }
        if (b) {
            j.getView().notifyMessage(b, "danger-red");
            return false
        }
        if (j.service) {
            j.recordRujukan = undefined;
            a.setLoading(true);
            j.service.cariRujukanDgnNoKartuBPJS(e, function (m, l) {
                if (m) {
                    var k = l.data.rujukan;
                    j.onSetDataRujukan(h, k, g)
                }
                a.setLoading(false)
            })
        }
    },
    onRujukanLainnya: function (h) {
        var j = this,
            f = j.getReferences(),
            a = j.getView(),
            g = f.formdetailantrian.getNik(),
            e = f.formantrian.getNokartu(),
            d = j.isValidNik(g),
            b = j.isValidNoKartu(e);
        if (d) {
            j.getView().notifyMessage(d, "danger-red");
            return false
        }
        if (b) {
            j.getView().notifyMessage(b, "danger-red");
            return false
        }
        if (j.service) {
            j.recordRujukan = undefined;
            j.recordJenisKunjungan = undefined;
            a.setLoading(true);
            j.cariRujukanDgnNoKartuBPJS(e, 1, function (m, l) {
                if (m) {
                    if (l.success) {
                        var k = l.data.rujukan;
                        j.recordJenisKunjungan = 2;
                        if (l.data.rujukan.length > 1) {
                            j.onSetListDataRujukan(h, k, g)
                        } else {
                            j.onSetDataRujukan(h, k[0], g)
                        }
                    } else {
                        j.cariRujukanDgnNoKartuBPJS(e, 1, function (p, o) {
                            if (p) {
                                if (o.success) {
                                    j.recordJenisKunjungan = 1;
                                    if (o.data.rujukan.length > 1) {
                                        var n = o.data.rujukan[0];
                                        j.onSetDataRujukan(h, n, g)
                                    } else {
                                        var n = o.data.rujukan[0];
                                        j.onSetDataRujukan(h, n, g)
                                    }
                                } else {
                                    j.showNotif("Informasi", "Rujukan Tidak Ditemukan Dengan No.Kartu Jaminan JKN / BPJS Tersebut Baik Dari Faskes 1 Ataupun 2", "window-red");
                                    a.setLoading(false)
                                }
                            } else {
                                a.setLoading(false)
                            }
                        })
                    }
                    a.setLoading(false)
                }
            })
        }
    },
    onRujukanLainnya2: function (h) {
        var j = this,
            f = j.getReferences(),
            a = j.getView(),
            g = f.formdetailantrian.getNik(),
            e = f.formantrian.getNokartu(),
            d = j.isValidNik(g),
            b = j.isValidNoKartu(e);
        if (d) {
            j.getView().notifyMessage(d, "danger-red");
            return false
        }
        if (b) {
            j.getView().notifyMessage(b, "danger-red");
            return false
        }
        if (j.service) {
            j.recordRujukan = undefined;
            j.recordJenisKunjungan = undefined;
            a.setLoading(true);
            j.cariRujukanDgnNoKartuBPJS(e, 2, function (m, l) {
                if (m) {
                    if (l.success) {
                        var k = l.data.rujukan;
                        j.recordJenisKunjungan = 2;
                        if (l.data.rujukan.length > 1) {
                            j.onSetListDataRujukan(h, k, g)
                        } else {
                            j.onSetDataRujukan(h, k[0], g)
                        }
                    } else {
                        j.cariRujukanDgnNoKartuBPJS(e, 1, function (p, o) {
                            if (p) {
                                if (o.success) {
                                    j.recordJenisKunjungan = 1;
                                    if (o.data.rujukan.length > 1) {
                                        var n = o.data.rujukan[0];
                                        j.onSetDataRujukan(h, n, g)
                                    } else {
                                        var n = o.data.rujukan[0];
                                        j.onSetDataRujukan(h, n, g)
                                    }
                                } else {
                                    j.showNotif("Informasi", "Rujukan Tidak Ditemukan Dengan No.Kartu Jaminan JKN / BPJS Tersebut Baik Dari Faskes 1 Ataupun 2", "window-red");
                                    a.setLoading(false)
                                }
                            } else {
                                a.setLoading(false)
                            }
                        })
                    }
                    a.setLoading(false)
                }
            })
        }
    },
    onSuratKontrol: function (j) {
        var e = this,
            g = e.getReferences(),
            h = e.getView(),
            f = g.formdetailantrian.getNik(),
            k = g.formantrian.getNokartu(),
            b = e.isValidNik(f),
            a = e.isValidNoKartu(k);
        if (b) {
            e.getView().notifyMessage(b, "danger-red");
            return false
        }
        if (a) {
            e.getView().notifyMessage(a, "danger-red");
            return false
        }
        if (e.service) {
            e.recordRujukan = undefined;
            var d = e.getView().getSysdate();
            h.setLoading(true);
            e.cariKontrolNoKartuBPJS(k, d, function (n, m) {
                if (n) {
                    if (m.success) {
                        var l = m.data;
                        e.onSetListDataKontrol(j, l, f)
                    } else {
                        e.showNotif("Informasi", "Surat Kontrol Tidak Ditemukan Dengan No.Kartu Jaminan JKN / BPJS Tersebut", "window-red");
                        h.setLoading(false)
                    }
                }
                h.setLoading(false)
            })
        }
    },
    cariRujukanDgnNoKartuBPJS: function (d, a, e) {
        var b = this;
        b.serviceantrian.request("plugins/getListRujukanKartu?noKartu=" + d + "&faskes=" + a, "GET", "", e)
    },
    cariKontrolNoKartuBPJS: function (e, a, f) {
        var b = this,
            d = Ext.Date.format(a, "Y-m-d");
        b.serviceantrian.request("plugins/getListSuratKontrol?nokartu=" + e + "&tanggal=" + d, "GET", "", f)
    },
    onSetListDataRujukan: function (f, d, e) {
        var g = this,
            b = g.getReferences(),
            a = g.getView();
        a.setLoading(true);
        a.openDialog("", true, "100%", "100%", {
            title: "List Data Rujukan Pasien <i><b>( Silahkan Pilih Salah Satu Rujukan Yang Ingin Digunakan )</b></i>",
            xtype: "antrian-onsite-v2-registrasi-rujukan",
            ui: "panel-cyan",
            hideHeaders: false,
            scrollable: true,
            showCloseButton: true
        }, function (k, j) {
            var h = j.down("antrian-onsite-v2-registrasi-rujukan");
            h.onSetData(d);
            h.on("success", function (l) {
                g.onSetDataRujukan(f, l.data, e);
                j.close()
            })
        }, this, true, true)
    },
    onSetListDataKontrol: function (e, b, d) {
        var f = this,
            a = f.getView();
        a.setLoading(true);
        a.openDialog("", true, "100%", "100%", {
            title: "List Data Surat Kontrol Pasien <i><b>( Silahkan Pilih Salah Satu Data SUrat Kontrol Yang Ingin Digunakan )</b></i>",
            xtype: "antrian-onsite-v2-registrasi-kontrol",
            ui: "panel-cyan",
            hideHeaders: false,
            scrollable: true,
            showCloseButton: true
        }, function (j, h) {
            var g = h.down("antrian-onsite-v2-registrasi-kontrol");
            g.onSetData(b);
            g.on("success", function (k) {
                f.onSetDataKontrol(e, k.data, d);
                h.close()
            })
        }, this, true, true)
    },
    onSetDataKontrol: function (f, d, e) {
        var g = this,
            b = g.getReferences(),
            a = g.getView();
        g.recordRujukan = d;
        a.openDialog("", true, 700, 470, {
            title: "Data Kontrol Pasien",
            xtype: "antrian-onsite-v2-registrasi-info",
            ui: "panel-cyan",
            hideHeaders: false,
            scrollable: true,
            showCloseButton: true
        }, function (k, j) {
            var h = j.down("antrian-onsite-v2-registrasi-info");
            h.onSetDataKontrol(d);
            h.on("success", function (l) {
                a.setLoading(true);
                b.formantrian.isNullMappingPoliKontrol(g.recordRujukan, function (m) {
                    if (m) {
                        g.showNotif("Error", "Poli tujuan belum di mapping, silahkan hubungi petugas registrasi", "window-red");
                        a.setLoading(false)
                    } else {
                        b.formantrian.getViewModel().set("isSelectJaminan", false);
                        b.formantrian.getViewModel().set("isPilihPoli", false);
                        j.close();
                        a.setLoading(false)
                    }
                })
            })
        }, this, true, true)
    },
    onSetDataRujukan: function (f, d, e) {
        var g = this,
            b = g.getReferences(),
            a = g.getView();
        if (d.peserta.nik != e) {
            g.showNotif("Informasi", "NIK tidak Sesuai Dengan No.Kartu Jaminan JKN / BPJS", "window-red");
            a.setLoading(false);
            return false
        }
        g.recordRujukan = d;
        a.openDialog("", true, 700, 470, {
            title: "Data Rujukan Pasien",
            xtype: "antrian-onsite-v2-registrasi-info",
            ui: "panel-cyan",
            hideHeaders: false,
            scrollable: true,
            showCloseButton: true
        }, function (k, j) {
            var h = j.down("antrian-onsite-v2-registrasi-info");
            h.onSetData(d);
            h.on("success", function (l) {
                a.setLoading(true);
                b.formantrian.isNullMappingPoli(g.recordRujukan, function (m) {
                    if (m) {
                        g.showNotif("Error", "Poli tujuan belum di mapping, silahkan hubungi petugas registrasi", "window-red");
                        a.setLoading(false)
                    } else {
                        b.formantrian.getViewModel().set("isSelectJaminan", false);
                        b.formantrian.getViewModel().set("isPilihPoli", false);
                        j.close();
                        a.setLoading(false)
                    }
                })
            })
        }, this, true, true)
    },
    onAmbilAntrian: function (h) {
        var g = this,
            d = g.getReferences(),
            b = g.getView(),
            a = d.formdetailantrian.getRecord(),
            f = d.formantrian.getRecord();
        record = Ext.create("antrian.reservasi.Model", {});
        if (f) {
            b.setLoading(true);
            if (f.get("CARABAYAR") == 2) {
                if (f.get("NO_KARTU_BPJS") == "") {
                    g.getView().notifyMessage("No.Kartu Jaminan JKN / BPJS Harus Di Terisi", "danger-red");
                    d.formantrian.focus("NO_KARTU_BPJS");
                    b.setLoading(false);
                    return false
                }
                if (f.get("NO_REF_BPJS") == "") {
                    g.getView().notifyMessage("No.Rujukan Jaminan JKN / BPJS Harus Di Terisi", "danger-red");
                    d.formantrian.focus("NO_REF_BPJS");
                    b.setLoading(false);
                    return false
                }
            }
            record.set("NORM", a.get("NORM"));
            record.set("NAMA", a.get("NAMA"));
            record.set("NIK", a.get("NIK"));
            record.set("CONTACT", a.get("CONTACT"));
            record.set("TEMPAT_LAHIR", a.get("TEMPAT_LAHIR"));
            record.set("TANGGAL_LAHIR", a.get("TANGGAL_LAHIR"));
            record.set("JENIS_APLIKASI", a.get("JENIS_APLIKASI"));
            record.set("TANGGALKUNJUNGAN", a.get("TANGGALKUNJUNGAN"));
            record.set("ALAMAT", a.get("ALAMAT"));
            record.set("JK", a.get("JENIS_KELAMIN"));
            record.set("POS_ANTRIAN", a.get("POS_ANTRIAN"));
            record.set("CARABAYAR", f.get("CARABAYAR"));
            record.set("NO_KARTU_BPJS", f.get("NO_KARTU_BPJS"));
            record.set("POLI", f.get("POLI"));
            record.set("DOKTER", f.get("DOKTER"));
            record.set("JAM_PRAKTEK", f.get("JAM_PRAKTEK"));
            record.set("POLI_BPJS", f.get("POLI_BPJS"));
            record.set("JENIS", f.get("JENIS"));
            if (f.get("CARABAYAR") == "2") {
                if (g.recordRujukan.jnsKontrol) {
                    poliRujukan = g.recordRujukan.poliTujuan;
                    if (g.recordRujukan.poliTujuan != f.get("POLI_BPJS")) {
                        g.recordJenisKunjungan = 2;
                        record.set("NO_REF_BPJS", f.get("NO_REF_BPJS"))
                    } else {
                        g.recordJenisKunjungan = 3;
                        record.set("NO_REF_BPJS", f.get("NO_REF_BPJS"))
                    }
                } else {
                    poliRujukan = g.recordRujukan.poliRujukan.kode;
                    record.set("NO_REF_BPJS", f.get("NO_REF_BPJS"))
                }
                record.set("REF_POLI_RUJUKAN", poliRujukan);
                record.set("JENIS_KUNJUNGAN", g.recordJenisKunjungan)
            }
            record.showError = true;
            record.save({
                callback: function (j, k, e) {
                    var l = JSON.parse(k._response.responseText);
                    if (e) {
                        b.fireEvent("success", l.response.pos);
                        b.setLoading(false);
                        g.onSetDataAntrian(h, l.response)
                    } else {
                        b.notifyMessage(l.metadata.message, "danger-red");
                        b.setLoading(false)
                    }
                }
            })
        }
    },
    onSetDataAntrian: function (d, b) {
        var e = this,
            a = e.getView();
        var f = Ext.create("Ext.Window", {
            header: false,
            modal: true,
            constrain: true,
            closable: true,
            width: 700,
            height: 600,
            layout: "fit",
            items: {
                title: "Bukti Registrasi Antrian",
                xtype: "antrian-onsite-v2-registrasi-bukti",
                ui: "panel-cyan",
                hideHeaders: false,
                scrollable: true,
                showCloseButton: true,
                listeners: {
                    cetakantrian: "onCetak"
                }
            }
        });
        f.on("show", function () {
            var g = f.down("antrian-onsite-v2-registrasi-bukti");
            g.onSetData(b);
            g.on("success", function (h) {
                f.close()
            })
        });
        f.show()
    }
});
Ext.define("antrian.onsite.V2.Workspace", {
    extend: "com.Form",
    xtype: "antrian-onsite-v2-workspace",
    controller: "antrian-onsite-v2-workspace",
    viewModel: {
        data: {
            ruangans: [],
            refreshTime: 0,
            instansi: undefined,
            infoTeks: "",
            tglNow: "-",
            statusWebsocket: "Disconnect",
            posAntrian: ""
        },
        stores: {
            store: {
                type: "instansi-store"
            }
        }
    },
    audio: {
        integrasi: undefined,
        service: undefined
    },
    layout: {
        type: "vbox",
        align: "stretch"
    },
    defaults: {
        border: false
    },
    idx: 0,
    bodyStyle: "background-color:#aa8a51",
    initComponent: function () {
        if (window.location.protocol == "http:") {
            var d = "ws"
        } else {
            var d = "wss"
        }
        var b = this;
        var a = Ext.create("Ext.ux.WebSocket", {
            url: "ws://" + window.location.hostname + ":8899",
            listeners: {
                open: function (e) {
                    if (b.getViewModel()) {
                        b.getViewModel().set("statusWebsocket", "Connected")
                    }
                },
                close: function (e) {
                    if (b.getViewModel()) {
                        b.getViewModel().set("statusWebsocket", "Disonnected Socket")
                    }
                }
            }
        });
        b.items = [{
            layout: {
                type: "hbox",
                align: "middle"
            },
            border: false,
            height: 50,
            bodyStyle: "padding-left:10px;background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,#356aa0), color-stop(100%,#356aa0));",
            items: [{
                xtype: "image",
                bind: {
                    src: "classic/resources/images/{instansi}.png"
                },
                id: "idImage",
                width: 40,
                border: false,
                bodyStyle: "background-color:transparent;"
            }, {
                flex: 1,
                bind: {
                    data: {
                        items: "{store.data.items}"
                    }
                },
                tpl: new Ext.XTemplate('<tpl for="items">', "{data.REFERENSI.PPK.NAMA}", "</tpl>"),
                border: false,
                bodyStyle: "background-color:transparent; font-size: 18px; color: white; "
            }, {
                xtype: "label",
                bind: {
                    html: "{posAntrian} | {tglNow}"
                },
                flex: 1,
                border: false,
                style: "background-color:transparent; font-size: 20px; color: white;text-align:right "
            }]
        }, {
            flex: 1,
            layout: {
                type: "hbox",
                align: "stretch"
            },
            defaults: {
                flex: 1,
                margin: "0 1 0 1"
            },
            border: false,
            reference: "informasi",
            items: [{
                flex: 2,
                border: false,
                layout: {
                    type: "vbox",
                    align: "stretch"
                },
                defaults: {
                    bodyStyle: "background-color:#D8F1EC"
                },
                items: [{
                    border: true,
                    style: "padding:15px;background-color:#A5C8D1;border-bottom:1px #DDD solid",
                    bodyStyle: "background-color:transparent",
                    html: '<iframe width="100%" height="300px" src="classic/resources/images/banner-antrian/video.mp4" frameborder="0" allow="accelerometer loop="true" autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
                }, {
                    xtype: "container",
                    style: "background-color:#A5C8D1;",
                    flex: 1
                }, {
                    style: "padding:10px;font-size:14px;border-top:1px #DDD solid;text-left:center;font-style:italic;color:#434343;background-color:#A5C8D1;",
                    bodyStyle: "background-color:transparent",
                    bind: {
                        html: "Status : {statusWebsocket}"
                    }
                }]
            }, {
                flex: 5,
                border: false,
                xtype: "antrian-onsite-v2-form"
            }]
        }, {
            layout: {
                type: "hbox",
                align: "middle"
            },
            height: 30,
            border: false,
            bodyStyle: "background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,#356aa0), color-stop(100%,#356aa0));",
            items: [{
                xtype: "displayfield",
                flex: 1,
                fieldStyle: "background-color:transparent;font-size: 14px;  margin-left: 10px;color: white;",
                border: false,
                bind: {
                    value: "<marquee>{infoTeks}</marquee>"
                }
            }]
        }];
        b.callParent(arguments)
    },
    onLoadRecord: function (b) {
        var e = this,
            d = e.down("antrian-onsite-v2-form"),
            a = e.getController();
        e.getViewModel().set("posAntrian", b.get("DESKRIPSI"));
        a.mulai();
        d.onLoadRecord(b)
    },
    onRefreshView: function (e) {
        var d = this,
            a = d.down("antrian-display-view").getStore(),
            b = a.getQueryParams().POS;
        if (b == e) {
            a.reload()
        }
    },
    runLogo: function () {
        if (this.deg == 360) {
            this.deg = 0
        } else {
            this.deg += 5
        }
        Ext.getCmp("idImage").setStyle("-webkit-transform: rotateY(" + this.deg + "deg)")
    }
});
Ext.define("antrian.onsite.V2.WorkspaceController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-onsite-v2-workspace",
    currentRefreshTimeRuangan: 0,
    refreshTime: 0,
    onAfterRender: function () {
        var e = this,
            b = e.getViewModel(),
            a = b.get("store"),
            d = Ext.getStore("instansi");
        if (d) {
            b.set("store", d);
            new Ext.util.DelayedTask(function () {
                b.set("instansi", d.getAt(0).get("PPK"))
            }).delay(1000)
        } else {
            a.doAfterLoad = function (f, h, g, j) {
                if (j) {
                    if (h.length > 0) {
                        b.set("instansi", h[0].get("PPK"))
                    }
                }
            };
            a.load()
        }
    },
    mulai: function (d) {
        var b = this,
            a = b.getViewModel();
        b.currentRefreshTimeRuangan = a.get("refreshTime");
        b.refreshTime = a.get("refreshTime");
        if (b.task == undefined) {
            b.task = {
                run: function () {
                    a.set("tglNow", Ext.Date.format(new Date(), "l, d F Y H:i:s"));
                    if (b.currentRefreshTimeRuangan == 0) {
                        b.currentRefreshTimeRuangan = b.refreshTime
                    }
                    b.currentRefreshTimeRuangan--;
                    a.set("refreshTime", b.currentRefreshTimeRuangan)
                },
                interval: 1000
            };
            Ext.TaskManager.start(b.task)
        }
    },
    destroy: function () {
        var a = this;
        Ext.TaskManager.stop(a.task);
        a.callParent()
    }
});
Ext.define("antrian.onsite.View1", {
    extend: "Ext.view.View",
    alias: "widget.antrian-onsite-view1",
    viewModel: {
        stores: {
            store: {
                type: "antrian-ruangan-store"
            }
        }
    },
    autoScroll: true,
    cls: "laporan-main laporan-dataview",
    bind: {
        store: "{store}"
    },
    itemSelector: "div.thumb-wrap",
    tpl: Ext.create("Ext.XTemplate", '<tpl for=".">', '<div class="thumb-wrap" style="padding:5px">', '<a class="thumb" href="#" style="background-color:darkcyan">', '<div class="thumb-title-container">', '<div class="thumb-title" style="font-size:62px;color:whitesmoke;font-weight: bold;font-variant:all-petite-caps;font-family:monospace;"><strong>{DESKRIPSI}</strong></div>', "</div>", '<div class="thumb-download"></div>', "</a>", "</div>", "</tpl>"),
    load: function () {
        var b = this.getViewModel().get("store");
        if (b) {
            b.removeAll();
            b.load()
        }
    }
});
Ext.define("antrian.onsite.View2", {
    extend: "com.Form",
    alias: "widget.antrian-onsite-view2",
    layout: {
        type: "vbox",
        align: "middle",
        pack: "center"
    },
    initComponent: function () {
        var a = this;
        a.items = [{
            layout: {
                type: "vbox",
                pack: "center"
            },
            width: 750,
            height: 400,
            items: [{
                xtype: "component",
                margin: "0 0 20 0",
                style: "font-size:14px;padding:15px;background:#D8F1EC;width:100%",
                html: "* Cetak Antrian Berdasarkan Jenis Pasien *"
            }, {
                xtype: "button",
                html: '<b style="font-size:32px">PASIEN LAMA</b>',
                ui: "soft-blue",
                margin: "0 0 20 0",
                width: "100%",
                height: 100,
                scale: "large",
                handler: "onPasienLama"
            }, {
                xtype: "button",
                html: '<b style="font-size:32px">PASIEN BARU</b>',
                ui: "soft-green",
                width: "100%",
                height: 100,
                scale: "large",
                handler: "onPasienBaru"
            }]
        }];
        a.callParent(arguments)
    }
});
Ext.define("antrian.onsite.View3", {
    extend: "com.Form",
    alias: "widget.antrian-onsite-view3",
    layout: "fit",
    bodyPadding: 2,
    title: "Antrian Onsite",
    ui: "panel-blue",
    items: [{
        title: "Pasien Lama",
        html: "Konten Pasien Lama"
    }, {
        title: "Pasien Baru",
        html: "Konten Pasien Lama"
    }],
    onLoadRecord: function () {}
});
Ext.define("antrian.onsite.Workspace", {
    extend: "com.Form",
    xtype: "antrian-onsite-workspace",
    controller: "antrian-onsite-workspace",
    viewModel: {
        stores: {
            storeRuangan: {
                type: "antrian-ruangan-store",
                queryParams: {
                    DEFAULT: 1,
                    start: 0,
                    limit: 1
                }
            }
        },
        data: {
            formConfig: {
                disabledField: true
            },
            headTitle: "Ambil Antrian Pendaftaran",
            posAntrian: "-",
            recordPos: "A",
            posAntrianList: true,
            hiddenPosAntrianJenis: true,
            hiddenPosAntrianView3: true,
            hiddenPosAntrianCaraBayar: true,
            hiddenPosAntrianFarmasi: true
        }
    },
    layout: {
        type: "vbox",
        align: "stretch"
    },
    header: {
        iconCls: "x-fa fa-list",
        padding: "7 7 7 7"
    },
    bind: {
        title: "{headTitle} | {posAntrian}"
    },
    ui: "panel-cyan",
    flex: 1,
    border: true,
    bodyPadding: 0,
    posantrians: undefined,
    initComponent: function () {
        var a = this;
        a.items = [{
            xtype: "container",
            height: 60,
            border: false,
            style: "padding:5px;text-align:center;border-bottom:0px #red solid;border-radius:0px;background:#1E90FF",
            bind: {
                hidden: "{posAntrianList}"
            },
            items: [{
                xtype: "textfield",
                width: "100%",
                height: 50,
                border: false,
                fieldStyle: "border-radius:5px",
                emptyText: "Cari Poliklinik Tujuan",
                listeners: {
                    search: "onSearch",
                    clear: "onClear"
                }
            }]
        }, {
            xtype: "antrian-onsite-view1",
            reference: "antrianonsiteview1",
            ui: "panel-cyan",
            hideHeaders: true,
            bind: {
                hidden: "{posAntrianList}"
            },
            flex: 1,
            listeners: {
                select: "onSelect"
            }
        }, {
            xtype: "antrian-onsite-view2",
            reference: "antrianonsiteview2",
            ui: "panel-cyan",
            hideHeaders: true,
            bind: {
                hidden: "{hiddenPosAntrianJenis}"
            },
            flex: 1,
            listeners: {
                select: "onSelect"
            }
        }, {
            xtype: "antrian-onsite-carabayar",
            reference: "antrianonsitecarabayar",
            ui: "panel-cyan",
            hideHeaders: true,
            bind: {
                hidden: "{hiddenPosAntrianCaraBayar}"
            },
            flex: 1,
            listeners: {
                select: "onSelect"
            }
        }, {
            xtype: "antrian-onsite-farmasi",
            reference: "antrianonsitefarmasi",
            ui: "panel-cyan",
            hideHeaders: true,
            bind: {
                hidden: "{hiddenPosAntrianFarmasi}"
            },
            flex: 1,
            listeners: {
                select: "onSelect"
            }
        }, {
            xtype: "antrian-onsite-v2-workspace",
            reference: "antrianonsiteview3",
            ui: "panel-cyan",
            hideHeaders: true,
            bind: {
                hidden: "{hiddenPosAntrianView3}"
            },
            flex: 1,
            listeners: {
                select: "onSelect"
            }
        }];
        a.callParent(arguments)
    },
    onLoadRecord: function (f, e) {
        var d = this,
            b = d.down("antrian-onsite-view1"),
            a = d.getViewModel().get("storeRuangan");
        a.load();
        d.setLoading(true);
        if (f) {
            d.getViewModel().set("posAntrian", f.get("DESKRIPSI"));
            d.getViewModel().set("recordPos", f.get("NOMOR"))
        }
        d.getViewModel().set("posAntrianList", true);
        d.getViewModel().set("hiddenPosAntrianCaraBayar", true);
        d.getViewModel().set("hiddenPosAntrianJenis", true);
        d.getViewModel().set("hiddenPosAntrianFarmasi", true);
        if (e) {
            if (e == "CB") {
                d.getViewModel().set("hiddenPosAntrianCaraBayar", false);
                b.load();
                d.setLoading(false)
            }
            if (e == "RUANGAN") {
                d.getViewModel().set("posAntrianList", false);
                b.load();
                d.setLoading(false)
            }
            if (e == "JENIS") {
                d.getViewModel().set("hiddenPosAntrianJenis", false);
                b.load();
                d.setLoading(false)
            }
            if (e == "FARMASI") {
                d.getViewModel().set("hiddenPosAntrianFarmasi", false);
                b.load();
                d.setLoading(false)
            }
        } else {
            if (d.getPropertyConfig("900301") == "TRUE") {
                d.getViewModel().set("posAntrianList", false);
                b.load();
                d.setLoading(false)
            }
            if (d.getPropertyConfig("900302") == "TRUE") {
                d.getViewModel().set("hiddenPosAntrianCaraBayar", false);
                b.load();
                d.setLoading(false)
            }
            if (d.getPropertyConfig("900303") == "TRUE") {
                d.getViewModel().set("hiddenPosAntrianJenis", false);
                b.load();
                d.setLoading(false)
            }
        }
    }
});
Ext.define("antrian.onsite.WorkspaceController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-onsite-workspace",
    onPasienBpjs: function (f) {
        var g = this,
            d = g.getView(),
            e = g.getViewModel().get("storeRuangan"),
            a = g.getViewModel().get("recordPos"),
            h = e.getData().items[0].get("ID"),
            b = Ext.create("antrian.reservasi.Model", {});
        b.set("POS_ANTRIAN", a);
        b.set("POLI", h);
        b.set("TANGGALKUNJUNGAN", g.getView().getSysdate());
        b.set("JENIS", 2);
        b.set("JENIS_APLIKASI", 5);
        b.set("CARABAYAR", 2);
        d.setLoading(true);
        b.save({
            callback: function (j, k, m) {
                if (m) {
                    g.getView().notifyMessage("Sukses, Sedang Proses Cetak Antrian");
                    var o = JSON.parse(k._response.responseText),
                        l = o.response.kodebooking,
                        n = o.response.pos;
                    g.cetakAntrian(l, n)
                } else {
                    var o = JSON.parse(k.error.response.responseText);
                    g.getView().notifyMessage(o.detail, "danger-red");
                    d.setLoading(false)
                }
            }
        })
    },
    onPasienNonBpjs: function (f) {
        var g = this,
            d = g.getView(),
            e = g.getViewModel().get("storeRuangan"),
            a = g.getViewModel().get("recordPos"),
            h = e.getData().items[0].get("ID"),
            b = Ext.create("antrian.reservasi.Model", {});
        b.set("POS_ANTRIAN", a);
        b.set("POLI", h);
        b.set("TANGGALKUNJUNGAN", g.getView().getSysdate());
        b.set("JENIS", 2);
        b.set("JENIS_APLIKASI", 5);
        b.set("CARABAYAR", 1);
        d.setLoading(true);
        b.save({
            callback: function (j, k, m) {
                if (m) {
                    g.getView().notifyMessage("Sukses, Sedang Proses Cetak Antrian");
                    var o = JSON.parse(k._response.responseText),
                        l = o.response.kodebooking,
                        n = o.response.pos;
                    g.cetakAntrian(l, n)
                } else {
                    var o = JSON.parse(k.error.response.responseText);
                    g.getView().notifyMessage(o.detail, "danger-red");
                    d.setLoading(false)
                }
            }
        })
    },
    onAntrianNonRacik: function (f) {
        var g = this,
            d = g.getView(),
            e = g.getViewModel().get("storeRuangan"),
            a = g.getViewModel().get("recordPos"),
            h = e.getData().items[0].get("ID"),
            b = Ext.create("antrian.reservasi.Model", {});
        b.set("POS_ANTRIAN", a);
        b.set("POLI", h);
        b.set("TANGGALKUNJUNGAN", g.getView().getSysdate());
        b.set("JENIS", 11);
        b.set("JENIS_APLIKASI", 5);
        b.set("CARABAYAR", 2);
        d.setLoading(true);
        b.save({
            callback: function (j, k, m) {
                if (m) {
                    g.getView().notifyMessage("Sukses, Sedang Proses Cetak Antrian");
                    var o = JSON.parse(k._response.responseText),
                        l = o.response.kodebooking,
                        n = o.response.pos;
                    g.cetakAntrian(l, n)
                } else {
                    var o = JSON.parse(k.error.response.responseText);
                    g.getView().notifyMessage(o.detail, "danger-red");
                    d.setLoading(false)
                }
            }
        })
    },
    onAntrianRacikan: function (f) {
        var g = this,
            d = g.getView(),
            e = g.getViewModel().get("storeRuangan"),
            a = g.getViewModel().get("recordPos"),
            h = e.getData().items[0].get("ID"),
            b = Ext.create("antrian.reservasi.Model", {});
        b.set("POS_ANTRIAN", a);
        b.set("POLI", h);
        b.set("TANGGALKUNJUNGAN", g.getView().getSysdate());
        b.set("JENIS", 22);
        b.set("JENIS_APLIKASI", 5);
        b.set("CARABAYAR", 1);
        d.setLoading(true);
        b.save({
            callback: function (j, k, m) {
                if (m) {
                    g.getView().notifyMessage("Sukses, Sedang Proses Cetak Antrian");
                    var o = JSON.parse(k._response.responseText),
                        l = o.response.kodebooking,
                        n = o.response.pos;
                    g.cetakAntrian(l, n)
                } else {
                    var o = JSON.parse(k.error.response.responseText);
                    g.getView().notifyMessage(o.detail, "danger-red");
                    d.setLoading(false)
                }
            }
        })
    },
    onPasienLama: function (f) {
        var g = this,
            d = g.getView(),
            e = g.getViewModel().get("storeRuangan"),
            a = g.getViewModel().get("recordPos"),
            h = e.getData().items[0].get("ID"),
            b = Ext.create("antrian.reservasi.Model", {});
        b.set("POS_ANTRIAN", a);
        b.set("POLI", h);
        b.set("TANGGALKUNJUNGAN", g.getView().getSysdate());
        b.set("JENIS", 1);
        b.set("JENIS_APLIKASI", 5);
        b.set("CARABAYAR", 1);
        d.setLoading(true);
        b.save({
            callback: function (j, k, m) {
                if (m) {
                    g.getView().notifyMessage("Sukses, Sedang Proses Cetak Antrian");
                    var o = JSON.parse(k._response.responseText),
                        l = o.response.kodebooking,
                        n = o.response.pos;
                    g.cetakAntrian(l, n)
                } else {
                    var o = JSON.parse(k.error.response.responseText);
                    g.getView().notifyMessage(o.detail, "danger-red");
                    d.setLoading(false)
                }
            }
        })
    },
    onPasienBaru: function (f) {
        var g = this,
            d = g.getView(),
            e = g.getViewModel().get("storeRuangan"),
            h = e.getData().items[0].get("ID"),
            a = g.getViewModel().get("recordPos"),
            b = Ext.create("antrian.reservasi.Model", {});
        b.set("POS_ANTRIAN", a);
        b.set("POLI", h);
        b.set("TANGGALKUNJUNGAN", g.getView().getSysdate());
        b.set("JENIS", 2);
        b.set("JENIS_APLIKASI", 5);
        b.set("CARABAYAR", 1);
        d.setLoading(true);
        b.save({
            callback: function (j, k, m) {
                if (m) {
                    g.getView().notifyMessage("Sukses, Sedang Proses Cetak Antrian");
                    var o = JSON.parse(k._response.responseText),
                        l = o.response.kodebooking,
                        n = o.response.pos;
                    g.cetakAntrian(l, n)
                } else {
                    var o = JSON.parse(k.error.response.responseText);
                    g.getView().notifyMessage(o.detail, "danger-red");
                    d.setLoading(false)
                }
            }
        })
    },
    cetakAntrian: function (d, e) {
        var b = this,
            a = b.getView();
        a.cetak({
            TITLE: "Cetak Antrian",
            NAME: "plugins.antrian.online.CetakKarcisAntrian",
            TYPE: "Word",
            EXT: "docx",
            PARAMETER: {
                PNOMOR: d
            },
            REQUEST_FOR_PRINT: true,
            PRINT_NAME: "CetakAntrian"
        });
        a.setLoading(false);
        b.onKirimEvenSocket(e)
    },
    onKirimEvenSocket: function (d) {
        console.log(d);
        if (window.location.protocol == "http:") {
            var b = "ws"
        } else {
            var b = "wss"
        }
        var a = b + "://" + window.location.hostname + ":8899";
        websocket = new WebSocket(a);
        websocket.onopen = function (f) {
            var e = {
                pos: d,
                act: "ANTRIAN_BARU"
            };
            websocket.send(JSON.stringify(e))
        }
    }
});
Ext.define("antrian.pengaturan.Workspace", {
    extend: "com.Form",
    xtype: "antrian-pengaturan-workspace",
    controller: "antrian-pengaturan-workspace",
    layout: "fit",
    bodyPadding: 2,
    items: [{
        xtype: "com-form",
        ui: "panel-black",
        title: "Pengaturan",
        titleFieldConfig: {},
        fullscreenEnabled: true,
        menuConfig: {
            enabled: true,
            width: 300,
            buttonConfig: {}
        },
        fullscreenConfig: {},
        header: {
            items: [{}]
        }
    }],
    defaults: {
        border: false,
        listeners: {
            requestreport: "onRequestReport"
        }
    },
    load: function (a) {
        var d = this,
            b = this.down("com-form");
        b.setMenus(d.childmenu("9003", 3, 2))
    },
    childmenu: function (f, e, a) {
        var d = this,
            b = [];
        xuam = Ext.JSON.decode(Ext.util.Base64.decode(d.app.xuam));
        xuam.forEach(function (h, g) {
            h = Ext.JSON.decode(Ext.util.Base64.decode(h));
            if (h.ID.substring(0, a + 2) == f && h.LEVEL == e + 1) {
                var j = {
                    text: h.DESKRIPSI,
                    leaf: h.HAVE_CHILD == 0,
                    iconCls: h.ICON_CLS
                };
                if (h.HAVE_CHILD == 0 || h.CLASS) {
                    j.className = h.CLASS;
                    j.idClassName = d.replaceAll(h.CLASS.toLowerCase(), ".", "_")
                } else {
                    j.children = d.childmenu(h.ID, parseInt(h.LEVEL), a + 2)
                }
                b.push(j)
            }
        });
        return b
    }
});
Ext.define("antrian.pengaturan.WorkspaceController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-pengaturan-workspace",
    onTabChange: function (b, a) {
        if (a.load) {
            a.load({})
        }
    },
    onRefresh: function (a) {
        var d = this;
        d.getView().loadStore({})
    },
    onRequestReport: function (f, d, e) {
        console.log("request");
        this.getView().fireEvent("requestreport", f, d, e)
    }
});
Ext.define("antrian.pengaturan.hakakses.Detil", {
    extend: "com.Grid",
    alias: "widget.antrian-pengaturan-hakakses-detil",
    controller: "antrian-pengaturan-hakakses-detil",
    viewModel: {
        stores: {
            store: {
                type: "antrian-posantrian-store"
            }
        },
        data: {
            recordPengguna: undefined
        }
    },
    initComponent: function () {
        var a = this;
        a.columns = [{
            xtype: "rownumberer",
            text: "No",
            align: "left",
            width: 60,
            listeners: {
                checkchange: "onChange"
            }
        }, {
            flex: 1,
            dataIndex: "DESKRIPSI"
        }, {
            xtype: "checkcolumn",
            dataIndex: "STATUS_AKSES_POS_ANTRIAN",
            width: 90,
            listeners: {
                checkchange: "onChange"
            }
        }];
        a.callParent(arguments)
    },
    onLoadRecord: function (d) {
        var b = this,
            a = b.getViewModel().get("store");
        if (d) {
            a.queryParams = {
                AKSES_PENGGUNA: d.get("ID")
            };
            a.load();
            b.getViewModel().set("recordPengguna", d)
        } else {
            b.getViewModel().set("recordPengguna", undefined)
        }
    }
});
Ext.define("antrian.pengaturan.hakakses.DetilController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-pengaturan-hakakses-detil",
    onChange: function (l, o, h) {
        var j = this,
            n = j.getView(),
            k = j.getViewModel(),
            p = k.get("store"),
            m = k.get("recordPengguna"),
            q = p.getAt(o),
            a = Ext.create("antrian.useraksespos.Model", {});
        if (a) {
            n.setLoading(true);
            a.set("STATUS", h ? 1 : 0);
            a.set("USER", m.get("ID"));
            a.set("POS_ANTRIAN", q.get("NOMOR"));
            a.scope = this;
            a.save({
                callback: function (d, e, b) {
                    if (b) {
                        j.getView().notifyMessage("Akses Pos Antrian Berhasil Di " + (h == true ? "Aktifkan" : "NonAktifkan"));
                        p.reload();
                        n.setLoading(false)
                    } else {
                        j.getView().notifyMessage("Akses Pos Antrian Gagal Di " + (h == true ? "Aktifkan" : "NonAktifkan"));
                        a.set("STATUS", h ? 0 : 1);
                        n.setLoading(false);
                        p.reload()
                    }
                }
            })
        }
    }
});
Ext.define("antrian.pengaturan.hakakses.List", {
    extend: "com.Grid",
    alias: "widget.antrian-pengaturan-hakakses-list",
    controller: "antrian-pengaturan-hakakses-list",
    viewModel: {
        stores: {
            store: {
                type: "pengguna-store"
            }
        }
    },
    initComponent: function () {
        var a = this;
        a.columns = [{
            text: "NIP",
            flex: 1,
            dataIndex: "NIP"
        }, {
            text: "LOGIN",
            flex: 1,
            dataIndex: "LOGIN"
        }, {
            text: "NAMA",
            flex: 1,
            dataIndex: "NAMA"
        }, {
            text: "NIK",
            flex: 1,
            dataIndex: "NIK"
        }], a.dockedItems = [{
            xtype: "pagingtoolbar",
            bind: {
                store: "{store}"
            },
            dock: "bottom",
            items: ["-", {}, {}, {
                xtype: "search-field",
                cls: "x-text-border",
                autoFocus: true,
                emptyText: "Nama",
                flex: 1,
                listeners: {
                    search: "onsearch",
                    clear: "onClear"
                }
            }]
        }];
        a.callParent(arguments)
    },
    onLoadRecord: function () {
        var b = this,
            a = b.getViewModel().get("store");
        if (a) {
            a.queryParams = {
                STATUS: 1
            };
            a.load()
        }
    }
});
Ext.define("antrian.pengaturan.hakakses.ListController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-pengaturan-hakakses-list",
    onsearch: function (k, g) {
        var h = this,
            j = h.getViewModel(),
            a = j.get("store");
        a.queryParams = {
            NAMA: g,
            page: 1,
            start: 0
        };
        a.load()
    },
    onClear: function () {
        var e = this,
            f = e.getViewModel(),
            a = f.get("store");
        delete a.queryParams.NAMA;
        delete a.queryParams.page;
        delete a.queryParams.start;
        a.load()
    }
});
Ext.define("antrian.pengaturan.hakakses.Workspace", {
    extend: "com.Form",
    xtype: "antrian-pengaturan-hakakses-workspace",
    controller: "antrian-pengaturan-hakakses-workspace",
    viewModel: {
        stores: {
            store: {
                type: "grouppenggunaaksesmodule-store"
            }
        }
    },
    layout: "border",
    defaults: {
        flex: 1
    },
    border: false,
    bodyPadding: 5,
    ui: "panel-cyan",
    initComponent: function () {
        var a = this;
        a.items = [{
            region: "center",
            flex: 2,
            xtype: "antrian-pengaturan-hakakses-list",
            margin: "0px 5px 0px 0px",
            header: {
                iconCls: "x-fa fa-user",
                padding: "7px 7px 7px 7px",
                title: "Pengguna"
            },
            ui: "panel-cyan",
            reference: "penggunalist",
            checkboxModel: false,
            listeners: {
                select: "onSelectPengguna"
            }
        }, {
            region: "east",
            flex: 1,
            header: {
                iconCls: "x-fa fa-list",
                padding: "7px 7px 7px 7px",
                title: "Pos Antrian"
            },
            xtype: "antrian-pengaturan-hakakses-detil",
            reference: "jenisaksesposantrian",
            ui: "panel-cyan",
            hideHeaders: true,
            checkboxModel: true
        }];
        a.callParent(arguments)
    },
    load: function (a) {
        console.log("load");
        var d = this,
            e = d.down("antrian-pengaturan-hakakses-list");
        e.onLoadRecord()
    }
});
Ext.define("antrian.pengaturan.hakakses.WorkspaceController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-pengaturan-hakakses-workspace",
    init: function () {
        var e = this,
            a = e.getView(),
            f = e.getViewModel().get("store");
        if (f) {
            f.on("beforesync", function () {
                a.setLoading(true)
            })
        }
    },
    onRefresh: function () {
        var e = this,
            f = e.getReferences(),
            a = e.getViewModel().get("store");
        if (a) {
            a.reload();
            f.penggunamodulchecktree.loadStore()
        }
    },
    onCheckChange: function (e, f) {
        var a = this;
        a.storeData(e, f);
        e.cascadeBy(function (b) {
            b.set("checked", f);
            a.storeData(b, f)
        })
    },
    privates: {
        storeData: function (k, l) {
            var m = this,
                n = m.getReferences(),
                a = n.penggunagrouplist.getSelection(),
                o = m.getViewModel().get("store"),
                j = o.findRecord("MODUL", k.get("ID"), 0, false, true, true);
            if (j) {
                if (Ext.isNumeric(j.get("ID")) && j.get("ID") != 0) {
                    j.set("STATUS", l ? 1 : 0);
                    m.checkGroup(k, l)
                } else {
                    if (!l) {
                        o.remove(j);
                        m.checkGroup(k, l)
                    }
                }
            } else {
                if (l) {
                    o.add(Ext.create("antrian.useraksespos.Model", {
                        USER: a[0].get("ID"),
                        POS_ANTRIAN: k.get("ID"),
                        STATUS: 1
                    }))
                }
                m.checkGroup(k, l)
            }
        },
        checkGroup: function (h, d) {
            var g = this,
                f = g.getReferences(),
                a = f.penggunamodulchecktree,
                b = a.getStore(),
                e = h.get("ID").length,
                j = parseInt(e) - 2;
            if (j != 0) {
                id_substr = h.get("ID").substr(0, j);
                find = b.findRecord("ID", id_substr, 0, false, true, true);
                if (d) {
                    find.set("checked", d);
                    if (find) {
                        g.storeData(find, d)
                    }
                }
            }
        }
    },
    onSelectPengguna: function (j, h, a) {
        var f = this,
            d = f.getReferences();
        if (h) {
            d.jenisaksesposantrian.onLoadRecord(h)
        }
    },
    onSimpan: function (g) {
        var f = this,
            e = f.getView(),
            a = f.getViewModel().get("store");
        a.sync({
            callback: function (h, d, b) {
                e.setLoading(false);
                e.notifyMessage("Data Akses Pos Antrian telah disimpan", "danger-blue")
            }
        })
    }
});
Ext.define("antrian.pengaturan.hfis.jadwaldokter.List", {
    extend: "com.Grid",
    alias: "widget.antrian-pengaturan-hfis-jadwaldokter-list",
    controller: "antrian-pengaturan-hfis-jadwaldokter-list",
    viewModel: {
        stores: {
            store: {
                type: "antrian-hfis-jadwaldokter-referensi-store"
            }
        }
    },
    ui: "panel-cyan",
    initComponent: function () {
        var a = this;
        a.columns = [{
            xtype: "rownumberer",
            text: "No",
            align: "left",
            width: 60
        }, {
            text: "Sub Spesialis",
            flex: 1,
            dataIndex: "NM_SUB_SPESIALIS",
            renderer: "onRenderSubSpesialis"
        }, {
            text: "Piliklinik",
            flex: 1,
            dataIndex: "NM_POLI",
            renderer: "onRenderPoli"
        }, {
            text: "Dokter",
            flex: 2,
            dataIndex: "NM_DOKTER"
        }, {
            text: "Hari",
            width: 150,
            dataIndex: "NM_HARI"
        }, {
            text: "Jam",
            width: 150,
            dataIndex: "JAM"
        }, {
            text: "Kapasitas Pasien",
            width: 100,
            dataIndex: "KAPASITAS"
        }, {
            text: "Kouta JKN",
            width: 100,
            dataIndex: "KOUTA_JKN"
        }, {
            text: "Kouta Non JKN",
            width: 100,
            dataIndex: "KOUTA_NON_JKN"
        }, {
            xtype: "checkcolumn",
            header: "STATUS",
            dataIndex: "STATUS",
            width: 90,
            listeners: {
                checkchange: "onChange"
            },
            hidden: a.hideHeaders
        }], a.dockedItems = [{
            xtype: "pagingtoolbar",
            bind: {
                store: "{store}"
            },
            dock: "bottom",
            displayInfo: true
        }];
        a.callParent(arguments)
    },
    onLoadRecord: function () {
        var d = this,
            b = d.getViewModel(),
            a = d.getViewModel().get("store");
        a.load()
    }
});
Ext.define("antrian.pengaturan.hfis.jadwaldokter.ListController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-pengaturan-hfis-jadwaldokter-list",
    onSearch: function (k, g) {
        var h = this,
            j = h.getViewModel(),
            a = j.get("store");
        a.queryParams = {
            QUERY: g,
            page: 1,
            start: 0
        };
        a.load()
    },
    onClear: function () {
        var e = this,
            f = e.getViewModel(),
            a = f.get("store");
        delete a.queryParams.QUERY;
        delete a.queryParams.page;
        delete a.queryParams.start;
        a.load()
    },
    onSinkronJadwal: function (f) {
        var g = this,
            d = g.getReferences(),
            b = g.getViewModel().get("store"),
            e = d.tanggal.getValue(),
            a = d.poli.getValue();
        b.queryParams = {
            sendToWs: 1,
            tanggal: e,
            poli: a
        };
        b.load()
    },
    onFilterJadwal: function (f) {
        var g = this,
            d = g.getReferences(),
            b = g.getViewModel().get("store"),
            e = d.tanggal.getValue(),
            a = d.poli.getValue();
        b.queryParams = {
            tanggal: e,
            poli: a
        };
        b.load()
    },
    onRefresh: function (b) {
        var d = this,
            a = d.getView();
        a.refresh()
    },
    onRenderPoli: function (b, a, e) {
        var d = e.get("REFERENSI") ? e.get("REFERENSI").POLI.KDPOLI + " | " + e.get("REFERENSI").POLI.NMPOLI : "-";
        return d
    },
    onRenderSubSpesialis: function (b, a, e) {
        var d = e.get("REFERENSI") ? e.get("REFERENSI").SUBSPESIALIS.KDSUBSPESIALIS + " | " + e.get("REFERENSI").SUBSPESIALIS.NMSUBSPESIALIS : "-";
        return d
    },
    onChange: function (o, a, l) {
        var m = this,
            j = m.getView(),
            n = m.getViewModel(),
            p = n.get("store"),
            k = p.getAt(a);
        k.set("STATUS", l ? 1 : 0);
        k.scope = this, record = Ext.create("antrian.hfis.jadwaldokter.Model", {});
        record.set("ID", k.get("ID"));
        record.set("UBAH_STATUS", 1);
        record.set("STATUS", l ? 1 : 0);
        record.save({
            callback: function (d, e, b) {
                if (b) {
                    j.notifyMessage("Status di" + (l == true ? "Aktifkan" : "Non Aktifkan"), "danger-blue");
                    j.reload()
                }
            }
        })
    },
    onKapasitasJkn: function (b, a, e) {
        var d = e.get("REFERENSI") ? e.get("REFERENSI").POLI.KDPOLI + " | " + e.get("REFERENSI").POLI.NMPOLI : "-";
        return d
    },
    onKapasitasNonJkn: function (b, a, e) {
        var d = e.get("REFERENSI") ? e.get("REFERENSI").POLI.KDPOLI + " | " + e.get("REFERENSI").POLI.NMPOLI : "-";
        return d
    }
});
Ext.define("antrian.pengaturan.hfis.jadwaldokter.Workspace", {
    extend: "com.Form",
    xtype: "antrian-pengaturan-hfis-jadwaldokter-workspace",
    bodyPadding: 2,
    layout: {
        type: "hbox",
        align: "stretch"
    },
    flex: 1,
    initComponent: function () {
        var a = this;
        a.items = [{
            xtype: "antrian-pengaturan-hfis-jadwaldokter-list",
            flex: 1,
            reference: "listjadwaldokterhfis",
            hideHeaders: false,
            header: {
                iconCls: "x-fa fa-list",
                padding: "5px 5px 5px 5px",
                title: "List Jadwal DOkter (By: HFIS)",
                items: [{
                    xtype: "search-field",
                    cls: "x-text-border",
                    emptyText: "Cari Nama Dokter",
                    margin: "0 5 0 0",
                    flex: 1,
                    listeners: {
                        search: "onSearch",
                        clear: "onClear"
                    }
                }, {
                    xtype: "antrian-combo-poli-bpjs",
                    name: "POLI",
                    firstLoad: true,
                    reference: "poli",
                    margin: "0 5 0 0"
                }, {
                    xtype: "datefield",
                    name: "TANGGAL",
                    format: "d-m-Y",
                    reference: "tanggal",
                    margin: "0 5 0 0"
                }, {
                    xtype: "button",
                    ui: "soft-green",
                    iconCls: "x-fa fa-refresh",
                    tooltip: "Filter Jadwal Yang SUdah Di Tarik Dari HFIS",
                    text: "Filter",
                    listeners: {
                        click: "onFilterJadwal"
                    }
                }, {
                    xtype: "button",
                    ui: "soft-blue",
                    iconCls: "x-fa fa-refresh",
                    tooltip: "Ambil Jadwal Dari HFIS",
                    text: "Ambil Jadwal Dari HFIS",
                    listeners: {
                        click: "onSinkronJadwal"
                    }
                }]
            }
        }];
        a.callParent(arguments)
    },
    onLoadRecord: function (d) {
        var a = this,
            b = a.down("antrian-pengaturan-hfis-jadwaldokter-list");
        b.onLoadRecord({})
    }
});
Ext.define("antrian.pengaturan.hfis.refpoli.List", {
    extend: "com.Grid",
    alias: "widget.antrian-pengaturan-hfis-refpoli-list",
    controller: "antrian-pengaturan-hfis-refpoli-list",
    viewModel: {
        stores: {
            store: {
                type: "antrian-polibpjs-referensi-store"
            }
        }
    },
    ui: "panel-cyan",
    header: {
        iconCls: "x-fa fa-list",
        padding: "5px 5px 5px 5px",
        title: "Referensi Poli (By: HFIS)",
        items: [{
            xtype: "button",
            ui: "soft-blue",
            iconCls: "x-fa fa-refresh",
            tooltip: "Ambil Referensi Poli Dari HFIS",
            text: "Ambil Referensi Poli Dari HFIS",
            listeners: {
                click: "onSinkronJadwal"
            }
        }]
    },
    initComponent: function () {
        var a = this;
        a.columns = [{
            xtype: "rownumberer",
            text: "No",
            align: "left",
            width: 60
        }, {
            text: "Kode Poli",
            flex: 1,
            dataIndex: "KDPOLI",
            renderer: "onRenderPoli"
        }, {
            text: "Nama Poli",
            flex: 1,
            dataIndex: "NMPOLI",
            renderer: "onRenderNmPoli"
        }, {
            text: "Kode Sub Spesialis",
            flex: 1,
            dataIndex: "KDSUBSPESIALIS",
            renderer: "onRenderSubSpesialis"
        }, {
            text: "Nama Sub Spesialis",
            flex: 1,
            dataIndex: "NMSUBSPESIALIS",
            renderer: "onRenderNmSubSpesialis"
        }], a.dockedItems = [{
            xtype: "pagingtoolbar",
            bind: {
                store: "{store}"
            },
            dock: "bottom",
            displayInfo: true
        }];
        a.callParent(arguments)
    },
    onLoadRecord: function () {
        var d = this,
            b = d.getViewModel(),
            a = d.getViewModel().get("store");
        a.load()
    }
});
Ext.define("antrian.pengaturan.hfis.refpoli.ListController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-pengaturan-hfis-refpoli-list",
    onSinkronJadwal: function (d) {
        var e = this,
            b = e.getReferences(),
            a = e.getViewModel().get("store");
        a.queryParams = {
            sendToWs: 1
        };
        a.load()
    },
    onRefresh: function (b) {
        var d = this,
            a = d.getView();
        a.refresh()
    },
    onRenderPoli: function (b, a, e) {
        var d = e.get("KDPOLI") ? e.get("KDPOLI") : "-";
        return d
    },
    onRenderNmPoli: function (b, a, e) {
        var d = e.get("NMPOLI") ? e.get("NMPOLI") : "-";
        return d
    },
    onRenderSubSpesialis: function (b, a, e) {
        var d = e.get("KDSUBSPESIALIS") ? e.get("KDSUBSPESIALIS") : "-";
        return d
    },
    onRenderNmSubSpesialis: function (b, a, e) {
        var d = e.get("NMSUBSPESIALIS") ? e.get("NMSUBSPESIALIS") : "-";
        return d
    }
});
Ext.define("antrian.pengaturan.hfis.refpoli.Workspace", {
    extend: "com.Form",
    xtype: "antrian-pengaturan-hfis-refpoli-workspace",
    bodyPadding: 2,
    layout: {
        type: "hbox",
        align: "stretch"
    },
    flex: 1,
    initComponent: function () {
        var a = this;
        a.items = [{
            xtype: "antrian-pengaturan-hfis-refpoli-list",
            flex: 1,
            reference: "listrefpolihfis"
        }];
        a.callParent(arguments)
    },
    onLoadRecord: function (d) {
        var a = this,
            b = a.down("antrian-pengaturan-hfis-refpoli-list");
        b.onLoadRecord({})
    }
});
Ext.define("antrian.pengaturan.monitoring.Detail", {
    extend: "com.Grid",
    alias: "widget.antrian-pengaturan-monitoring-detail",
    controller: "antrian-pengaturan-monitoring-detail",
    viewModel: {
        stores: {
            store: {
                type: "antrian-reservasi-store",
                autoSync: true
            }
        },
        data: {
            isEdit: true
        }
    },
    penggunaAksesPos: [],
    ui: "panel-cyan",
    header: {
        iconCls: "x-fa fa-list",
        padding: "5px 5px 5px 5px",
        title: "Detail Data Antrian"
    },
    initComponent: function () {
        var a = this;
        a.cellEditing = new Ext.grid.plugin.CellEditing({
            clicksToEdit: 1,
            listeners: {
                beforeedit: "beforeEdit"
            }
        });
        a.plugins = [a.cellEditing];
        a.columns = [{
            text: "Kode Booking",
            dataIndex: "NO",
            menuDisabled: true,
            sortable: false,
            align: "left",
            width: 150,
            renderer: "onAntrian"
        }, {
            text: "No.RM",
            dataIndex: "NORM",
            menuDisabled: true,
            sortable: false,
            align: "left",
            width: 150,
            renderer: "onRm"
        }, {
            text: "No.Kartu",
            dataIndex: "NO_KARTU_BPJS",
            menuDisabled: true,
            sortable: false,
            align: "left",
            flex: 1,
            renderer: "onKartu",
            editor: {
                xtype: "textfield",
                emptyText: "No.Kartu",
                name: "NO_KARTU_BPJS",
                bind: {
                    disabled: "{isEdit}"
                }
            }
        }, {
            text: "NIK",
            dataIndex: "NIK",
            menuDisabled: true,
            sortable: false,
            align: "left",
            flex: 1,
            renderer: "onNik",
            editor: {
                xtype: "textfield",
                emptyText: "NIK",
                name: "NIK",
                bind: {
                    disabled: "{isEdit}"
                }
            }
        }, {
            text: "No.Telepon / HP",
            dataIndex: "CONTACT",
            menuDisabled: true,
            sortable: false,
            align: "left",
            flex: 1,
            renderer: "onTlp",
            editor: {
                xtype: "textfield",
                emptyText: "No.Telepon / HP",
                name: "CONTACT",
                bind: {
                    disabled: "{isEdit}"
                }
            }
        }, {
            text: "No.Rujukan / Kontrol",
            dataIndex: "NO_REF_BPJS",
            menuDisabled: true,
            sortable: false,
            align: "left",
            flex: 1,
            renderer: "onRujukan",
            editor: {
                xtype: "textfield",
                emptyText: "No.Rujukan",
                name: "NO_REF_BPJS",
                bind: {
                    disabled: "{isEdit}"
                }
            }
        }, {
            text: "Poli Tujuan",
            dataIndex: "POLI",
            menuDisabled: true,
            sortable: false,
            align: "left",
            flex: 1,
            renderer: "onPoli"
        }], a.dockedItems = [{
            xtype: "pagingtoolbar",
            bind: {
                store: "{store}"
            },
            dock: "bottom",
            displayInfo: true
        }];
        a.callParent(arguments)
    },
    onLoadRecord: function (e, d) {
        var b = this,
            a = b.getViewModel().get("store");
        b.getViewModel().set("isEdit", d);
        a.queryParams = {
            NOMOR: e.get("ID")
        };
        a.load()
    }
});
Ext.define("antrian.pengaturan.monitoring.DetailController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-pengaturan-monitoring-detail",
    beforeEdit: function (e, d, b) {
        var g = this,
            f = g.getViewModel(),
            a = f.getStore("store"),
            h = a.getAt(d.rowIdx);
        if (h.get(d.field) == "1") {
            d.cancel = true
        }
    },
    onRefresh: function (b) {
        var d = this,
            a = d.getView();
        a.refresh()
    },
    onAntrian: function (b, a, d) {
        return d.get("ID")
    },
    onPoli: function (d, b, e) {
        var a = e.get("REFERENSI").POLI_BPJS.NMPOLI;
        return a
    },
    onRm: function (d, b, e) {
        var a = e.get("NORM");
        return a
    },
    onKartu: function (b, a, e) {
        var d = e.get("NO_KARTU_BPJS");
        this.setBackGround(a);
        return d
    },
    onNik: function (d, b, e) {
        var a = e.get("NIK");
        this.setBackGround(b);
        return a
    },
    onTlp: function (b, a, e) {
        var d = e.get("CONTACT");
        this.setBackGround(a);
        return d
    },
    onRujukan: function (b, a, e) {
        var d = e.get("NO_REF_BPJS");
        this.setBackGround(a);
        return d
    },
    setBackGround: function (b, a) {
        b.style = "background-color:#0df775;color:#000000;font-weight: bold"
    }
});
Ext.define("antrian.pengaturan.monitoring.Form", {
    extend: "com.Form",
    xtype: "antrian-pengaturan-monitoring-form",
    requires: ["Ext.picker.Time"],
    controller: "antrian-pengaturan-monitoring-form",
    layout: {
        type: "hbox"
    },
    initComponent: function () {
        var a = this;
        a.items = [{
            xtype: "button",
            text: "Kirim Antrian",
            ui: "soft-blue",
            handler: "onKirimAntrian",
            margin: "0 10 0 0"
        }, {
            xtype: "button",
            text: "Task (1)",
            ui: "soft-green",
            handler: "onUpdateWaktuTunggu1",
            margin: "0 10 0 0"
        }, {
            xtype: "button",
            text: "Task (2)",
            ui: "soft-green",
            handler: "onUpdateWaktuTunggu2",
            margin: "0 10 0 0"
        }, {
            xtype: "button",
            text: "Task (3)",
            ui: "soft-green",
            handler: "onUpdateWaktuTunggu3",
            margin: "0 10 0 0"
        }, {
            xtype: "button",
            text: "Task (4)",
            ui: "soft-green",
            handler: "onUpdateWaktuTunggu4",
            margin: "0 10 0 0"
        }, {
            xtype: "button",
            text: "Task (5)",
            ui: "soft-green",
            handler: "onUpdateWaktuTunggu5",
            margin: "0 10 0 0"
        }, {
            xtype: "button",
            text: "Task (6)",
            ui: "soft-green",
            handler: "onUpdateWaktuTunggu6",
            margin: "0 10 0 0"
        }, {
            xtype: "button",
            text: "Task (7)",
            ui: "soft-green",
            handler: "onUpdateWaktuTunggu7",
            margin: "0 10 0 0"
        }, {
            xtype: "button",
            text: "Batalkan",
            ui: "soft-red",
            handler: "onBatalAntrian",
            margin: "0 10 0 0"
        }];
        a.callParent(arguments)
    },
    onLoadRecord: function (d) {
        var b = this,
            a = b.getSysdate()
    }
});
Ext.define("antrian.pengaturan.monitoring.FormController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-pengaturan-monitoring-form",
    onKirimAntrian: function (b) {
        var d = this,
            a = d.getView();
        a.fireEvent("kirimantrian")
    },
    onUpdateWaktuTunggu1: function (b) {
        var d = this,
            a = d.getView();
        a.fireEvent("updatewaktutunggu", 1)
    },
    onUpdateWaktuTunggu2: function (b) {
        var d = this,
            a = d.getView();
        a.fireEvent("updatewaktutunggu", 2)
    },
    onUpdateWaktuTunggu3: function (b) {
        var d = this,
            a = d.getView();
        a.fireEvent("updatewaktutunggu", 3)
    },
    onUpdateWaktuTunggu4: function (b) {
        var d = this,
            a = d.getView();
        a.fireEvent("updatewaktutunggu", 4)
    },
    onUpdateWaktuTunggu5: function (b) {
        var d = this,
            a = d.getView();
        a.fireEvent("updatewaktutunggu", 5)
    },
    onUpdateWaktuTunggu6: function (b) {
        var d = this,
            a = d.getView();
        a.fireEvent("updatewaktutunggu", 6)
    },
    onUpdateWaktuTunggu7: function (b) {
        var d = this,
            a = d.getView();
        a.fireEvent("updatewaktutunggu", 7)
    },
    onBatalAntrian: function (b) {
        var d = this,
            a = d.getView();
        a.fireEvent("batalantrian", 99)
    }
});
Ext.define("antrian.pengaturan.monitoring.List", {
    extend: "com.Grid",
    alias: "widget.antrian-pengaturan-monitoring-list",
    controller: "antrian-pengaturan-monitoring-list",
    viewModel: {
        stores: {
            store: {
                type: "antrian-reservasi-store"
            }
        }
    },
    penggunaAksesPos: [],
    ui: "panel-cyan",
    header: {
        iconCls: "x-fa fa-list",
        padding: "5px 5px 5px 5px",
        title: "Monitoring Status Pengiriman Antrian Ke BPJS",
        items: [{
            xtype: "combobox",
            name: "POS_ANTRIAN",
            allowBlank: false,
            enterFocus: true,
            reference: "posantrian",
            enforceMaxLength: true,
            forceSelection: true,
            validateOnBlur: true,
            displayField: "DESKRIPSI",
            valueField: "NOMOR",
            queryMode: "local",
            margin: "0 5 0 0",
            typeAhead: true,
            emptyText: "[ Pilih Pos Antrian ]",
            store: {
                model: "data.model.Kategori"
            }
        }, {
            xtype: "combobox",
            reference: "jeniscarabayar",
            emptyText: "[ Filter Penjamin ]",
            store: Ext.create("Ext.data.Store", {
                fields: ["value", "desk"],
                data: [{
                    value: "",
                    desk: "Semua"
                }, {
                    value: "1",
                    desk: "Umum / Corporate"
                }, {
                    value: "2",
                    desk: "BPJS / JKN"
                }]
            }),
            queryMode: "local",
            displayField: "desk",
            value: 2,
            margin: "0 5 0 0",
            valueField: "value"
        }, {
            xtype: "datefield",
            name: "TANGGAL",
            format: "d-m-Y",
            reference: "tanggal",
            margin: "0 5 0 0"
        }, {
            xtype: "combobox",
            reference: "jenisaplikasiantrian",
            emptyText: "[ Jenis Antrian ]",
            margin: "0 5 0 0",
            store: Ext.create("Ext.data.Store", {
                fields: ["value", "desk"],
                data: [{
                    value: "0",
                    desk: "Semua"
                }, {
                    value: "2",
                    desk: "Mobile JKN"
                }, {
                    value: "3",
                    desk: "Kontrol"
                }, {
                    value: "22",
                    desk: "Web & Mobile APK"
                }]
            }),
            value: "",
            queryMode: "local",
            displayField: "desk",
            valueField: "value"
        }, {
            xtype: "button",
            ui: "soft-green",
            iconCls: "x-fa fa-refresh",
            tooltip: "Filter Data Antrian",
            text: "Filter",
            listeners: {
                click: "onFilterAntrian"
            }
        }]
    },
    initComponent: function () {
        var a = this;
        a.cellEditing = new Ext.grid.plugin.CellEditing({
            clicksToEdit: 1,
            listeners: {
                afteredit: "afterEdit",
                beforeedit: "beforeEdit"
            }
        });
        a.plugins = [a.cellEditing];
        a.columnLines = true, a.selModel = {
            type: "checkboxmodel",
            checkOnly: true
        };
        a.columns = [{
            text: "No.Antrian",
            dataIndex: "NO",
            menuDisabled: true,
            sortable: false,
            align: "left",
            width: 100,
            renderer: "onAntrian"
        }, {
            text: "No.RM",
            dataIndex: "NORM",
            menuDisabled: true,
            sortable: false,
            align: "left",
            width: 100,
            renderer: "onRm",
            editor: {
                xtype: "textfield",
                emptyText: "Norm",
                name: "NORM",
                readonly: true
            }
        }, {
            text: "Nama",
            dataIndex: "NAMA",
            menuDisabled: true,
            sortable: false,
            align: "left",
            width: 100,
            renderer: "onNama"
        }, {
            text: "No.Kartu",
            dataIndex: "NO_KARTU_BPJS",
            menuDisabled: true,
            sortable: false,
            align: "left",
            width: 100,
            renderer: "onKartu",
            editor: {
                xtype: "textfield",
                emptyText: "No.Kartu",
                name: "NO_KARTU_BPJS",
                readonly: true
            }
        }, {
            text: "Poli Tujuan",
            dataIndex: "POLI",
            menuDisabled: true,
            sortable: false,
            align: "left",
            width: 200,
            renderer: "onPoli"
        }, {
            text: "Dokter",
            dataIndex: "DOKTER",
            menuDisabled: true,
            sortable: false,
            align: "left",
            width: 200,
            renderer: "onDokter"
        }, {
            text: "Status Task ID",
            flex: 1,
            columns: [{
                dataIndex: "STATUS_TASK_ID1",
                text: "Task ID 1",
                renderer: "onTask1",
                editor: {
                    xtype: "datetimefield",
                    emptyText: "[Jam:Mnt:Dtk]",
                    format: "Y-m-d H:i:s",
                    name: "TASK1",
                    TASK: 1
                }
            }, {
                dataIndex: "STATUS_TASK_ID2",
                text: "Task ID 2",
                renderer: "onTask2",
                editor: {
                    xtype: "datetimefield",
                    emptyText: "[Jam:Mnt:Dtk]",
                    format: "Y-m-d H:i:s",
                    name: "TASK2",
                    TASK: 2
                }
            }, {
                dataIndex: "STATUS_TASK_ID3",
                text: "Task ID 3",
                renderer: "onTask3",
                editor: {
                    xtype: "datetimefield",
                    emptyText: "[Jam:Mnt:Dtk]",
                    format: "Y-m-d H:i:s",
                    name: "TASK3",
                    TASK: 3
                }
            }, {
                dataIndex: "STATUS_TASK_ID4",
                text: "Task ID 4",
                renderer: "onTask4",
                editor: {
                    xtype: "datetimefield",
                    emptyText: "[Jam:Mnt:Dtk]",
                    format: "Y-m-d H:i:s",
                    name: "TASK4",
                    TASK: 4
                }
            }, {
                dataIndex: "STATUS_TASK_ID5",
                text: "Task ID 5",
                renderer: "onTask5",
                editor: {
                    xtype: "datetimefield",
                    emptyText: "[Jam:Mnt:Dtk]",
                    format: "Y-m-d H:i:s",
                    name: "TASK5",
                    TASK: 5
                }
            }, {
                dataIndex: "STATUS_TASK_ID6",
                text: "Task ID 6",
                renderer: "onTask6",
                editor: {
                    xtype: "datetimefield",
                    emptyText: "[Jam:Mnt:Dtk]",
                    format: "Y-m-d H:i:s",
                    name: "TASK6",
                    TASK: 6
                }
            }, {
                dataIndex: "STATUS_TASK_ID7",
                text: "Task ID 7",
                renderer: "onTask7",
                editor: {
                    xtype: "datetimefield",
                    emptyText: "[Jam:Mnt:Dtk]",
                    format: "Y-m-d H:i:s",
                    name: "TASK7",
                    TASK: 7
                }
            }]
        }, {
            text: "Status Kirim BPJS",
            width: 300,
            renderer: "onRenderStatusKirim"
        }, {
            text: "Detail",
            xtype: "actioncolumn",
            align: "center",
            width: 75,
            items: [{
                xtype: "tool",
                iconCls: "x-fa fa-arrow-circle-right",
                tooltip: "Detail Data Antrian",
                handler: "onViewData"
            }]
        }, {
            text: "#",
            xtype: "actioncolumn",
            align: "center",
            width: 75,
            items: [{
                xtype: "tool",
                iconCls: "x-fa fa-edit",
                tooltip: "Ubah Rujukan Menjadi Kontrol Internal",
                handler: "onUbahKontrolInternal"
            }]
        }], a.dockedItems = [{
            xtype: "pagingtoolbar",
            bind: {
                store: "{store}"
            },
            dock: "bottom",
            items: [{
                xtype: "combobox",
                reference: "jenisfilter",
                emptyText: "[ Jenis Filter ]",
                margin: "0 5 0 0",
                store: Ext.create("Ext.data.Store", {
                    fields: ["ID", "DESKRIPSI"],
                    data: [{
                        ID: "1",
                        DESKRIPSI: "No.RM"
                    }, {
                        ID: "2",
                        DESKRIPSI: "Nama"
                    }, {
                        ID: "3",
                        DESKRIPSI: "No.Kartu"
                    }, {
                        ID: "4",
                        DESKRIPSI: "NIK"
                    }, {
                        ID: "5",
                        DESKRIPSI: "Kode Booking"
                    }]
                }),
                value: "1",
                queryMode: "local",
                displayField: "DESKRIPSI",
                valueField: "ID",
                listeners: {
                    select: "onSelectJenisFilter"
                }
            }, {
                xtype: "search-field",
                cls: "x-text-border",
                autoFocus: true,
                emptyText: "Cari ...",
                flex: 1,
                listeners: {
                    search: "onsearch",
                    clear: "onClear"
                }
            }]
        }];
        a.callParent(arguments)
    },
    onSetGrid: function (d) {
        var b = this,
            e = b.down("[reference=posantrian]"),
            a = b.getViewModel().get("store");
        e.getStore().loadData(b.getAksesPosAntrian());
        a.queryParams = {
            GET_VARIABEL_BPJS: 1,
            TANGGALKUNJUNGAN: "0000-00-00",
            POS_ANTRIAN: "",
            JENIS_APLIKASI: "0"
        };
        a.load()
    },
    getAksesPosAntrian: function () {
        var a = this;
        return a.penggunaAksesPos ? a.penggunaAksesPos : []
    },
    loadData: function () {
        var a = this;
        Ext.Ajax.request({
            url: webservice.location + "registrasionline/plugins/getAksesPosAntrian",
            useDefaultXhrHeader: false,
            withCredentials: true,
            success: function (d) {
                var b = Ext.JSON.decode(d.responseText);
                var e = b.data.AKSES_POS_ANTRIAN;
                a.penggunaAksesPos = e;
                a.onSetGrid(e)
            },
            failure: function (b) {
                return []
            }
        })
    }
});
Ext.define("antrian.pengaturan.monitoring.ListController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-pengaturan-monitoring-list",
    idxSelected: 1,
    onSelectJenisFilter: function (b, a) {
        this.idxSelected = a.get("ID")
    },
    beforeEdit: function (e, d, b) {
        var g = this,
            f = g.getViewModel(),
            a = f.getStore("store"),
            h = a.getAt(d.rowIdx);
        if (h.get(d.field) == "1") {
            d.cancel = true
        }
    },
    afterEdit: function (g, j, d) {
        var h = this,
            a = h.getView(),
            f = h.getViewModel(),
            b = f.getStore("store"),
            k = j.record;
        record = Ext.create("antrian.waktutungguantrian.Model", {});
        record.set("ANTRIAN", k.get("ID"));
        record.set("TASK_ID", j.column.field.TASK);
        record.set("TANGGAL", j.value);
        record.set("STATUS", 0);
        record.set("RESPONSE", "LOCAL");
        a.setLoading(true);
        record.save({
            callback: function (e, l, m) {
                if (m) {
                    b.reload();
                    a.setLoading(false)
                } else {
                    var n = JSON.parse(l.error.response.responseText);
                    h.getView().notifyMessage(n.detail, "danger-red");
                    b.reload();
                    a.setLoading(false)
                }
            }
        })
    },
    onFilterAntrian: function (k) {
        var d = this,
            g = d.getReferences(),
            j = d.getViewModel().get("store"),
            a = Ext.Date.format(g.tanggal.getValue(), "Y-m-d"),
            f = g.posantrian.getValue(),
            e = g.jeniscarabayar.getValue(),
            h = g.jenisaplikasiantrian.getValue(),
            b = j.getQueryParams();
        b.GET_VARIABEL_BPJS = 1;
        b.TANGGALKUNJUNGAN = a;
        b.POS_ANTRIAN = f;
        b.FILTER_CB = e;
        if (h == "" || h == "0") {
            delete j.queryParams.JENIS_APLIKASI
        } else {
            b.JENIS_APLIKASI = h
        }
        j.setQueryParams(b);
        j.load()
    },
    onRefresh: function (b) {
        var d = this,
            a = d.getView();
        a.refresh()
    },
    onAntrian: function (d, b, e) {
        if (e.get("CARABAYAR") == 2) {
            var a = 2
        } else {
            var a = 1
        }
        this.setBackGround(b, e.get("STATUS_KIRIM_BPJS"));
        return e.get("POS_ANTRIAN") + "" + a + "-" + Ext.String.leftPad(d, 3, "0")
    },
    onPoli: function (d, b, e) {
        var a = e.get("REFERENSI").POLI_BPJS.NMPOLI;
        this.setBackGround(b, e.get("STATUS_KIRIM_BPJS"));
        return a
    },
    onRm: function (d, b, e) {
        var a = e.get("NORM");
        this.setBackGround(b, e.get("STATUS_KIRIM_BPJS"));
        return a
    },
    onNama: function (b, a, e) {
        var d = e.get("NAMA");
        this.setBackGround(a, e.get("STATUS_KIRIM_BPJS"));
        return d
    },
    onDokter: function (d, b, f) {
        var e = f.get("REFERENSI") ? f.get("REFERENSI") : null;
        var a = e ? e.DOKTER_HFIS.NM_DOKTER : "-";
        this.setBackGround(b, f.get("STATUS_KIRIM_BPJS"));
        return a
    },
    onKartu: function (b, a, e) {
        var d = e.get("NO_KARTU_BPJS");
        this.setBackGround(a, e.get("STATUS_KIRIM_BPJS"));
        return d
    },
    onTask1: function (d, b, e) {
        var a = e.get("REFERENSI").TASK_ID_ANTRIAN.TASK_1;
        this.setBackGroundTask(b, e.get("STATUS_TASK_ID1"));
        return a
    },
    onTask2: function (d, b, e) {
        var a = e.get("REFERENSI").TASK_ID_ANTRIAN.TASK_2;
        this.setBackGroundTask(b, e.get("STATUS_TASK_ID2"));
        return a
    },
    onTask3: function (d, b, e) {
        var a = e.get("REFERENSI").TASK_ID_ANTRIAN.TASK_3;
        this.setBackGroundTask(b, e.get("STATUS_TASK_ID3"));
        return a
    },
    onTask4: function (d, b, e) {
        var a = e.get("REFERENSI").TASK_ID_ANTRIAN.TASK_4;
        this.setBackGroundTask(b, e.get("STATUS_TASK_ID4"));
        return a
    },
    onTask5: function (d, b, e) {
        var a = e.get("REFERENSI").TASK_ID_ANTRIAN.TASK_5;
        this.setBackGroundTask(b, e.get("STATUS_TASK_ID5"));
        return a
    },
    onTask6: function (d, b, e) {
        var a = e.get("REFERENSI").TASK_ID_ANTRIAN.TASK_6;
        this.setBackGroundTask(b, e.get("STATUS_TASK_ID6"));
        return a
    },
    onTask7: function (d, b, e) {
        var a = e.get("REFERENSI").TASK_ID_ANTRIAN.TASK_7;
        this.setBackGroundTask(b, e.get("STATUS_TASK_ID7"));
        return a
    },
    onRenderStatusKirim: function (d, b, e) {
        var a = e.get("REFERENSI").STATUS_KIRIM_BPJS.RESPONSE;
        this.setBackGround(b, e.get("STATUS_KIRIM_BPJS"));
        return a
    },
    setBackGround: function (b, a) {
        if (a == 1) {
            b.style = "background-color:#0df775;color:#000000;font-weight: bold"
        }
    },
    setBackGroundTask: function (b, a) {
        if (a == 1) {
            b.style = "background-color:#0df775;color:#000000;font-weight: bold"
        } else {
            if (a == 0) {
                b.style = "background-color:#A9A9A9;color:#000000;font-weight: bold"
            } else {
                b.style = "color:#DDD"
            }
        }
    },
    onViewData: function (d, h, b) {
        var e = this,
            a = e.getView(),
            f = false,
            g = d.getStore().getAt(h);
        if (g) {
            if (g.get("STATUS_KIRIM_BPJS") == 1) {
                f = true
            }
            a.openDialog("", true, "100%", "100%", {
                xtype: "antrian-pengaturan-monitoring-detail",
                ui: "panel-cyan",
                title: "Data",
                showCloseButton: true,
                scrollable: false
            }, function (l, k) {
                var j = k.down("antrian-pengaturan-monitoring-detail");
                j.onLoadRecord(g, f);
                j.on("success", function (m) {
                    d.getStore().reload();
                    k.close()
                })
            }, e, true, false)
        } else {
            a.notifyMessage("Record Not Found")
        }
    },
    onUbahKontrolInternal: function (e, j, d) {
        var g = this,
            b = g.getView(),
            h = e.getStore().getAt(j),
            f = Ext.getStore("instansi");
        f = f ? f.getAt(0) : null;
        if (f) {
            koders = f.get("REFERENSI").PPK.BPJS
        }
        koders = koders + (koders == "" ? koders : "");
        if (h) {
            if (h.get("STATUS_KIRIM_BPJS") == 0) {
                var a = "K" + koders + h.get("ID");
                h.set("JENIS_KUNJUNGAN", 2);
                h.set("NO_REF_BPJS", a);
                h.showError = true;
                h.save({
                    callback: function (l, m, k) {
                        if (k) {
                            e.getStore().reload()
                        } else {
                            b.notifyMessage("Gagal", "danger-red");
                            e.getStore().reload()
                        }
                    }
                })
            }
        } else {
            b.notifyMessage("Record Not Found")
        }
    },
    onsearch: function (b, a) {
        this.query = a;
        this.cari()
    },
    onClear: function () {
        this.query = "";
        this.cari()
    },
    privates: {
        cari: function () {
            var d = this,
                a = d.getView(),
                b = d.getViewModel().get("store"),
                e = b.getQueryParams();
            if (e.NORM) {
                delete b.queryParams.NORM
            }
            if (e.QUERY) {
                delete b.queryParams.QUERY
            }
            if (e.NO_KARTU_BPJS) {
                delete b.queryParams.NO_KARTU_BPJS
            }
            if (e.NIK) {
                delete b.queryParams.NIK
            }
            if (e.NOMOR) {
                delete b.queryParams.NOMOR
            }
            if (d.query != "") {
                if (this.idxSelected == 1) {
                    e.NORM = d.query
                }
                if (this.idxSelected == 2) {
                    e.QUERY = d.query
                }
                if (this.idxSelected == 3) {
                    e.NO_KARTU_BPJS = d.query
                }
                if (this.idxSelected == 4) {
                    e.NIK = d.query
                }
                if (this.idxSelected == 5) {
                    e.NOMOR = d.query
                }
            }
            a.setParams(e);
            a.load()
        }
    }
});
Ext.define("antrian.pengaturan.monitoring.Workspace", {
    extend: "com.Form",
    xtype: "antrian-pengaturan-monitoring-workspace",
    controller: "antrian-pengaturan-monitoring-workspace",
    bodyPadding: 2,
    layout: {
        type: "hbox",
        align: "stretch"
    },
    flex: 1,
    initComponent: function () {
        var a = this;
        a.items = [{
            flex: 1,
            layout: "border",
            items: [{
                region: "center",
                xtype: "antrian-pengaturan-monitoring-list",
                reference: "listmonitoringstatusantrian",
                flex: 1
            }, {
                region: "south",
                xtype: "antrian-pengaturan-monitoring-form",
                reference: "formmonitoringstatusantrian",
                border: true,
                listeners: {
                    kirimantrian: "onKirimAntrian",
                    updatewaktutunggu: "onUpdateWaktuTunggu",
                    batalantrian: "onBatalAntrian"
                }
            }]
        }];
        a.callParent(arguments)
    },
    onLoadRecord: function (e) {
        var b = this,
            d = b.down("antrian-pengaturan-monitoring-list"),
            a = b.down("antrian-pengaturan-monitoring-form");
        d.loadData();
        a.onLoadRecord()
    }
});
Ext.define("antrian.pengaturan.monitoring.WorkspaceController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-pengaturan-monitoring-workspace",
    onKirimAntrian: function () {
        var f = this,
            b = f.getView(),
            e = f.getReferences(),
            h = e.listmonitoringstatusantrian.getSelectionModel(),
            d = e.listmonitoringstatusantrian.getStore(),
            g = h.selected,
            a = Ext.create("antrian.kirimantrian.Model", {});
        c = [];
        g.each(function (j) {
            if (j.get("STATUS_KIRIM_BPJS") == "0") {
                c.push({
                    kodebooking: j.get("REFERENSI").RESERVASI_ANTRIAN.kodebooking,
                    jenispasien: j.get("REFERENSI").RESERVASI_ANTRIAN.jenispasien,
                    nomorkartu: j.get("REFERENSI").RESERVASI_ANTRIAN.nomorkartu,
                    nik: j.get("REFERENSI").RESERVASI_ANTRIAN.nik,
                    nohp: j.get("REFERENSI").RESERVASI_ANTRIAN.nohp,
                    kodepoli: j.get("REFERENSI").RESERVASI_ANTRIAN.kodepoli,
                    namapoli: j.get("REFERENSI").RESERVASI_ANTRIAN.namapoli,
                    pasienbaru: j.get("REFERENSI").RESERVASI_ANTRIAN.pasienbaru,
                    norm: j.get("REFERENSI").RESERVASI_ANTRIAN.norm,
                    tanggalperiksa: j.get("REFERENSI").RESERVASI_ANTRIAN.tanggalperiksa,
                    kodedokter: j.get("REFERENSI").RESERVASI_ANTRIAN.kodedokter,
                    namadokter: j.get("REFERENSI").RESERVASI_ANTRIAN.namadokter,
                    jampraktek: j.get("REFERENSI").RESERVASI_ANTRIAN.jampraktek,
                    jeniskunjungan: j.get("REFERENSI").RESERVASI_ANTRIAN.jeniskunjungan,
                    nomorreferensi: j.get("REFERENSI").RESERVASI_ANTRIAN.nomorreferensi,
                    nomorantrean: j.get("REFERENSI").RESERVASI_ANTRIAN.nomorantrean,
                    angkaantrean: j.get("REFERENSI").RESERVASI_ANTRIAN.angkaantrean,
                    estimasidilayani: j.get("REFERENSI").RESERVASI_ANTRIAN.estimasidilayani,
                    sisakuotajkn: j.get("REFERENSI").RESERVASI_ANTRIAN.sisakuotajkn,
                    kuotajkn: j.get("REFERENSI").RESERVASI_ANTRIAN.kuotajkn,
                    sisakuotanonjkn: j.get("REFERENSI").RESERVASI_ANTRIAN.sisakuotanonjkn,
                    kuotanonjkn: j.get("REFERENSI").RESERVASI_ANTRIAN.kuotanonjkn,
                    keterangan: "Diharapkan datang paling lambat 15 menit sebelum estimasi jam pendaftaran"
                })
            }
        });
        if (c.length > 0) {
            a.set("DETAIL_ANTRIAN", c);
            b.setLoading(true);
            a.save({
                callback: function (j, k, l) {
                    if (l) {
                        d.reload();
                        b.setLoading(false)
                    } else {
                        var m = JSON.parse(k.error.response.responseText);
                        f.getView().notifyMessage(m.detail, "danger-red");
                        d.reload();
                        b.setLoading(false)
                    }
                }
            })
        } else {
            b.notifyMessage("Silahkan Pilih Row Data Yang Akan Di Kirim", "danger-red")
        }
    },
    onUpdateWaktuTunggu: function (f) {
        var g = this,
            b = g.getView(),
            e = g.getReferences(),
            j = e.listmonitoringstatusantrian.getSelectionModel(),
            d = e.listmonitoringstatusantrian.getStore(),
            h = j.selected,
            a = Ext.create("antrian.waktutungguantrian.manual.Model", {});
        c = [];
        h.each(function (l) {
            if (f == "1") {
                var k = l.get("REFERENSI").TASK_ID_ANTRIAN.TASK_1
            }
            if (f == "2") {
                var k = l.get("REFERENSI").TASK_ID_ANTRIAN.TASK_2
            }
            if (f == "3") {
                var k = l.get("REFERENSI").TASK_ID_ANTRIAN.TASK_3
            }
            if (f == "4") {
                var k = l.get("REFERENSI").TASK_ID_ANTRIAN.TASK_4
            }
            if (f == "5") {
                var k = l.get("REFERENSI").TASK_ID_ANTRIAN.TASK_5
            }
            if (f == "6") {
                var k = l.get("REFERENSI").TASK_ID_ANTRIAN.TASK_6
            }
            if (f == "7") {
                var k = l.get("REFERENSI").TASK_ID_ANTRIAN.TASK_7
            }
            if (f == "99") {
                var k = b.getSysdate()
            }
            c.push({
                kodebooking: l.get("ID"),
                taskid: f,
                waktu: k
            })
        });
        if (c.length > 0) {
            a.set("DETAIL_ANTRIAN", c);
            b.setLoading(true);
            a.save({
                callback: function (k, l, m) {
                    if (m) {
                        d.reload();
                        b.setLoading(false)
                    } else {
                        var n = JSON.parse(l.error.response.responseText);
                        g.getView().notifyMessage(n.detail, "danger-red");
                        d.reload();
                        b.setLoading(false)
                    }
                }
            })
        } else {
            b.notifyMessage("Silahkan Pilih Row Data Yang Akan Di Kirim", "danger-red")
        }
    },
    onBatalAntrian: function (f) {
        var g = this,
            b = g.getView(),
            e = g.getReferences(),
            j = e.listmonitoringstatusantrian.getSelectionModel(),
            d = e.listmonitoringstatusantrian.getStore(),
            h = j.selected,
            a = Ext.create("antrian.waktutungguantrian.batal.Model", {});
        c = [];
        h.each(function (k) {
            c.push({
                kodebooking: k.get("ID"),
                keterangan: "Tidak Datang"
            })
        });
        if (c.length > 0) {
            a.set("DETAIL_ANTRIAN", c);
            b.setLoading(true);
            a.save({
                callback: function (k, l, m) {
                    if (m) {
                        d.reload();
                        b.setLoading(false)
                    } else {
                        var n = JSON.parse(l.error.response.responseText);
                        g.getView().notifyMessage(n.detail, "danger-red");
                        d.reload();
                        b.setLoading(false)
                    }
                }
            })
        } else {
            b.notifyMessage("Silahkan Pilih Row Data Yang Akan Di Kirim", "danger-red")
        }
    }
});
Ext.define("antrian.pengaturan.monitoring.antrian.DetailController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-pengaturan-monitoring-antrian-detail",
    onRenderKode: function (b, a, e) {
        var d = e.get("kodebooking") ? e.get("kodebooking") : "-";
        return d
    },
    onRenderNorm: function (b, a, e) {
        var d = e.get("norekammedis") ? e.get("norekammedis") : "-";
        return d
    },
    onRenderNik: function (b, a, e) {
        var d = e.get("nik") ? e.get("nik") : "0";
        return d
    },
    onRenderNoka: function (b, a, e) {
        var d = e.get("nokapst") ? e.get("nokapst") : "-";
        return d
    },
    onRenderHp: function (b, a, e) {
        var d = e.get("nohp") ? e.get("nohp") : "-";
        return d
    },
    onRenderPoli: function (b, a, e) {
        var d = e.get("kodepoli") ? e.get("kodepoli") : "-";
        return d
    },
    onRenderAntrean: function (b, a, e) {
        var d = e.get("noantrean") ? e.get("noantrean") : "-";
        return d
    },
    onRenderStatus: function (b, a, e) {
        var d = e.get("status") ? e.get("status") : "0000-00-00";
        return d
    }
});
Ext.define("antrian.pengaturan.monitoring.antrian.Detail", {
    extend: "com.Grid",
    alias: "widget.antrian-pengaturan-monitoring-antrian-detail",
    controller: "antrian-pengaturan-monitoring-antrian-detail",
    viewModel: {
        stores: {
            store: {
                type: "antrian-reservasi-store"
            }
        }
    },
    ui: "panel-cyan",
    header: {
        iconCls: "x-fa fa-list",
        padding: "5px 5px 5px 5px",
        title: "Detail Data Antrian"
    },
    initComponent: function () {
        var a = this;
        a.plugins = [{
            ptype: "cellediting",
            clicksToEdit: 1
        }], a.columns = [{
            xtype: "rownumberer",
            text: "No",
            align: "left",
            width: 60
        }, {
            text: "Kode Booking",
            width: 120,
            dataIndex: "kodebooking",
            renderer: "onRenderKode",
            editor: {
                readOnly: true,
                selectOnFocus: true
            }
        }, {
            text: "No.Rm",
            width: 100,
            dataIndex: "norekammedis",
            renderer: "onRenderNorm",
            editor: {
                readOnly: true,
                selectOnFocus: true
            }
        }, {
            text: "NIK",
            width: 150,
            dataIndex: "nik",
            renderer: "onRenderNik",
            editor: {
                readOnly: true,
                selectOnFocus: true
            }
        }, {
            text: "No. Kartu",
            width: 150,
            dataIndex: "nokapst",
            renderer: "onRenderNoka",
            editor: {
                readOnly: true,
                selectOnFocus: true
            }
        }, {
            text: "No. HP",
            width: 150,
            dataIndex: "nohp",
            renderer: "onRenderHp",
            editor: {
                readOnly: true,
                selectOnFocus: true
            }
        }, {
            text: "Kode Poli",
            width: 100,
            dataIndex: "kodepoli",
            renderer: "onRenderPoli",
            editor: {
                readOnly: true,
                selectOnFocus: true
            }
        }, {
            text: "No.Antrean",
            width: 100,
            dataIndex: "noantrean",
            renderer: "onRenderAntrean",
            editor: {
                readOnly: true,
                selectOnFocus: true
            }
        }, {
            text: "Status",
            width: 100,
            dataIndex: "status",
            renderer: "onRenderStatus"
        }];
        a.callParent(arguments)
    },
    onLoadRecord: function (d) {
        var b = this,
            a = b.getViewModel().get("store");
        a.queryParams = {
            GET_ANTRIAN_PER_DOKTER: 1,
            POLI: d.get("KD_SUB_SPESIALIS"),
            DOKTER: d.get("KD_DOKTER"),
            TANGGAL: d.get("TANGGAL")
        };
        a.load()
    },
    doAfterLoad: function (g, d, k, b) {
        try {
            if (!k) {
                if (b.error) {
                    var a = b.error.response,
                        h = Ext.JSON.decode(a.responseText),
                        f = h.detail ? (Ext.isObject(h.detail) ? Ext.JSON.encode(h.detail) : h.detail) : "Koneksi Gagal";
                    g.notifyMessage(f, "danger-red")
                }
            }
        } catch (j) {
            g.notifyMessage("Koneksi Gagal", "danger-red")
        }
    }
});
Ext.define("antrian.pengaturan.monitoring.antrian.List", {
    extend: "com.Grid",
    alias: "widget.antrian-pengaturan-monitoring-antrian-list",
    controller: "antrian-pengaturan-monitoring-antrian-list",
    viewModel: {
        stores: {
            store: {
                type: "antrian-reservasi-store"
            }
        }
    },
    ui: "panel-cyan",
    header: {
        iconCls: "x-fa fa-list",
        padding: "5px 5px 5px 5px",
        title: "Rekap Pasien Antrian Dokter",
        items: [{
            xtype: "datefield",
            name: "TANGGAL",
            format: "d-m-Y",
            reference: "tanggal",
            margin: "0 5 0 0"
        }, {
            xtype: "button",
            ui: "soft-green",
            iconCls: "x-fa fa-search",
            tooltip: "Filter",
            text: "Filter",
            listeners: {
                click: "onFilterJadwal"
            }
        }]
    },
    initComponent: function () {
        var a = this;
        a.columns = [{
            xtype: "rownumberer",
            text: "No",
            align: "left",
            width: 60
        }, {
            text: "Sub Spesialis",
            flex: 1,
            dataIndex: "KD_SUB_SPESIALIS"
        }, {
            text: "Piliklinik",
            flex: 1,
            dataIndex: "NAMAPOLIRS"
        }, {
            text: "Dokter",
            flex: 2,
            dataIndex: "NM_DOKTER"
        }, {
            text: "Jumlah Pasien Antrian",
            width: 100,
            dataIndex: "JML_ANTRIAN"
        }, {
            text: "Data Antrian",
            xtype: "actioncolumn",
            align: "center",
            width: 150,
            items: [{
                xtype: "tool",
                iconCls: "x-fa fa-search",
                tooltip: "Detail Data Antrian Dokter",
                handler: "onViewData"
            }]
        }];
        a.callParent(arguments)
    },
    onLoadRecord: function () {
        var b = this,
            a = b.getViewModel().get("store");
        if (a) {
            a.queryParams = {
                GET_REKAP_ANTRIAN_PER_TANGGAL: 1,
                TANGGAL: b.getSysdate()
            };
            a.load()
        }
    }
});
Ext.define("antrian.pengaturan.monitoring.antrian.ListController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-pengaturan-monitoring-antrian-list",
    onSearch: function (k, g) {
        var h = this,
            j = h.getViewModel(),
            a = j.get("store");
        a.queryParams = {
            QUERY: g,
            STATUS: 1,
            page: 1,
            start: 0
        };
        a.load()
    },
    onClear: function () {
        var e = this,
            f = e.getViewModel(),
            a = f.get("store");
        delete a.queryParams.QUERY;
        delete a.queryParams.page;
        delete a.queryParams.start;
        a.load()
    },
    onFilterJadwal: function (e) {
        var f = this,
            b = f.getReferences(),
            a = f.getViewModel().get("store"),
            d = b.tanggal.getValue();
        a.queryParams = {
            GET_REKAP_ANTRIAN_PER_TANGGAL: 1,
            TANGGAL: d
        };
        a.load()
    },
    onRefresh: function (b) {
        var d = this,
            a = d.getView();
        a.refresh()
    },
    onRenderPoli: function (b, a, e) {
        var d = e.get("REFERENSI") ? e.get("REFERENSI").POLI.KDPOLI + " | " + e.get("REFERENSI").POLI.NMPOLI : "-";
        return d
    },
    onRenderSubSpesialis: function (b, a, e) {
        var d = e.get("REFERENSI") ? e.get("REFERENSI").SUBSPESIALIS.KDSUBSPESIALIS + " | " + e.get("REFERENSI").SUBSPESIALIS.NMSUBSPESIALIS : "-";
        return d
    },
    onViewData: function (d, g, b) {
        var e = this,
            a = e.getView(),
            f = d.getStore().getAt(g);
        if (f) {
            a.openDialog("", true, "100%", "100%", {
                xtype: "antrian-pengaturan-monitoring-antrian-detail",
                ui: "panel-cyan",
                title: "Detail Pasien Antrian Dokter",
                showCloseButton: true,
                scrollable: false
            }, function (k, j) {
                var h = j.down("antrian-pengaturan-monitoring-antrian-detail");
                h.onLoadRecord(f);
                h.on("success", function (l) {
                    d.getStore().reload();
                    j.close()
                })
            }, e, true, false)
        } else {
            a.notifyMessage("Record Not Found")
        }
    }
});
Ext.define("antrian.pengaturan.monitoring.antrian.Workspace", {
    extend: "com.Form",
    xtype: "antrian-pengaturan-monitoring-antrian-workspace",
    bodyPadding: 2,
    layout: {
        type: "hbox",
        align: "stretch"
    },
    flex: 1,
    initComponent: function () {
        var a = this;
        a.items = [{
            xtype: "antrian-pengaturan-monitoring-antrian-list",
            flex: 1,
            reference: "listjadwaldokterhfis"
        }];
        a.callParent(arguments)
    },
    onLoadRecord: function (d) {
        var a = this,
            b = a.down("antrian-pengaturan-monitoring-antrian-list");
        b.onLoadRecord({})
    }
});
Ext.define("antrian.pengaturan.monitoring.pengunjung.List", {
    extend: "com.Grid",
    alias: "widget.antrian-pengaturan-monitoring-pengunjung-list",
    controller: "antrian-pengaturan-monitoring-pengunjung-list",
    viewModel: {
        stores: {
            store: {
                type: "antrian-pengunjung-store"
            }
        }
    },
    ui: "panel-cyan",
    header: {
        iconCls: "x-fa fa-list",
        padding: "5px 5px 5px 5px",
        title: "List Pengunjung Tidak Ada Antrian",
        items: [{
            xtype: "datefield",
            margin: "0 5 0 0",
            reference: "tanggalmulai"
        }, {
            xtype: "datefield",
            margin: "0 5 0 0",
            reference: "tanggalselesai"
        }, {
            xtype: "button",
            iconCls: "x-fa fa-search",
            tooltip: "Filter",
            text: "Filter",
            listeners: {
                click: "onFilter"
            }
        }]
    },
    initComponent: function () {
        var a = this;
        a.columns = [{
            xtype: "rownumberer",
            text: "No",
            align: "left",
            width: 60
        }, {
            text: "Pos",
            width: 100,
            dataIndex: "POS_ANTRIAN",
            renderer: "onRenderKode"
        }, {
            text: "Pengunjung",
            flex: 2,
            columns: [{
                dataIndex: "NORM",
                flex: 0.5,
                text: "No.RM"
            }, {
                dataIndex: "NIK",
                flex: 0.5,
                text: "NIK",
                renderer: "onTask2"
            }, {
                dataIndex: "NAMA",
                flex: 0.5,
                text: "Nama"
            }, {
                dataIndex: "NO_KARTU_BPJS",
                flex: 0.5,
                text: "No.Kartu"
            }]
        }, {
            text: "Tujuan Kunjungan",
            flex: 1,
            columns: [{
                dataIndex: "POLI_BPJS",
                flex: 0.5,
                text: "Poli"
            }, {
                dataIndex: "TANGGALKUNJUNGAN",
                flex: 0.5,
                text: "Tanggal"
            }, {
                dataIndex: "DOKTER",
                flex: 0.5,
                text: "Dokter"
            }]
        }], a.fbar = [{
            ui: "soft-green",
            iconCls: "x-fa fa-refresh",
            text: "Proses & Create Antrian",
            listeners: {
                click: "onProses"
            }
        }];
        a.callParent(arguments)
    },
    onLoadRecord: function () {
        var b = this,
            a = b.getViewModel().get("store");
        if (a) {
            a.queryParams = {
                PAWAL: b.getSysdate(),
                PAKHIR: b.getSysdate()
            };
            a.load()
        }
    }
});
Ext.define("antrian.pengaturan.pengaturan.monitoring.pengunjung.ListController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-pengaturan-monitoring-pengunjung-list",
    onFilter: function (d) {
        var e = this,
            b = e.getReferences(),
            a = e.getViewModel().get("store");
        a.queryParams = {
            PAWAL: (b.tanggalmulai.getValue()) ? Ext.Date.format(b.tanggalmulai.getValue(), "Y-m-d 00:00:00") : Ext.Date.format(e.getSysdate(), "Y-m-d 00:00:00"),
            PAKHIR: (b.tanggalmulai.getValue()) ? Ext.Date.format(b.tanggalmulai.getValue(), "Y-m-d 23:59:59") : Ext.Date.format(e.getSysdate(), "Y-m-d 23:59:59")
        };
        a.load()
    },
    onProses: function (d) {
        var e = this,
            b = e.getReferences(),
            a = e.getViewModel().get("store");
        a.queryParams = {
            PAWAL: (b.tanggalmulai.getValue()) ? Ext.Date.format(b.tanggalmulai.getValue(), "Y-m-d 00:00:00") : Ext.Date.format(e.getSysdate(), "Y-m-d 00:00:00"),
            PAKHIR: (b.tanggalmulai.getValue()) ? Ext.Date.format(b.tanggalmulai.getValue(), "Y-m-d 23:59:59") : Ext.Date.format(e.getSysdate(), "Y-m-d 23:59:59"),
            PROSES_DATA: 1
        };
        a.load({
            callback: function (g, f, h) {
                if (h) {
                    delete a.queryParams.PROSES_DATA;
                    a.load()
                }
            }
        })
    },
    onRefresh: function (b) {
        var d = this,
            a = d.getView();
        a.refresh()
    },
    onViewData: function (d, g, b) {
        var e = this,
            a = e.getView(),
            f = d.getStore().getAt(g);
        if (f) {
            a.openDialog("", true, "100%", "100%", {
                xtype: "antrian-pengaturan-monitoring-antrian-detail",
                ui: "panel-cyan",
                title: "Detail Pasien Antrian Dokter",
                showCloseButton: true,
                scrollable: false
            }, function (k, j) {
                var h = j.down("antrian-pengaturan-monitoring-antrian-detail");
                h.onLoadRecord(f);
                h.on("success", function (l) {
                    d.getStore().reload();
                    j.close()
                })
            }, e, true, false)
        } else {
            a.notifyMessage("Record Not Found")
        }
    }
});
Ext.define("antrian.pengaturan.monitoring.pengunjung.Workspace", {
    extend: "com.Form",
    xtype: "antrian-pengaturan-monitoring-pengunjung-workspace",
    bodyPadding: 2,
    layout: {
        type: "hbox",
        align: "stretch"
    },
    flex: 1,
    initComponent: function () {
        var a = this;
        a.items = [{
            xtype: "antrian-pengaturan-monitoring-pengunjung-list",
            flex: 1,
            reference: "listjadwaldokterhfis"
        }];
        a.callParent(arguments)
    },
    onLoadRecord: function (d) {
        var a = this,
            b = a.down("antrian-pengaturan-monitoring-pengunjung-list");
        b.onLoadRecord({})
    }
});
Ext.define("antrian.pengaturan.referensi.Workspace", {
    extend: "com.Form",
    xtype: "antrian-pengaturan-referensi-workspace",
    controller: "antrian-pengaturan-referensi-workspace",
    layout: "fit",
    bodyPadding: 0,
    items: [{
        xtype: "com-form",
        ui: "panel-blue",
        title: "Referensi Mobile JKN",
        titleFieldConfig: {},
        fullscreenEnabled: true,
        menuConfig: {
            enabled: true,
            width: 250,
            buttonConfig: {}
        },
        fullscreenConfig: {},
        header: {
            items: [{}]
        }
    }],
    defaults: {
        border: false,
        listeners: {
            requestreport: "onRequestReport"
        }
    },
    load: function (a) {
        var d = this,
            b = this.down("com-form");
        b.setMenus(d.childmenu("900305", 4, 4))
    },
    childmenu: function (f, e, a) {
        var d = this,
            b = [];
        xuam = Ext.JSON.decode(Ext.util.Base64.decode(d.app.xuam));
        xuam.forEach(function (h, g) {
            h = Ext.JSON.decode(Ext.util.Base64.decode(h));
            if (h.ID.substring(0, a + 2) == f && h.LEVEL == e + 1) {
                var j = {
                    text: h.DESKRIPSI,
                    leaf: h.HAVE_CHILD == 0,
                    iconCls: h.ICON_CLS
                };
                if (h.HAVE_CHILD == 0 || h.CLASS) {
                    j.className = h.CLASS;
                    j.idClassName = d.replaceAll(h.CLASS.toLowerCase(), ".", "_")
                } else {
                    j.children = d.childmenu(h.ID, parseInt(h.LEVEL), a + 2)
                }
                b.push(j)
            }
        });
        return b
    }
});
Ext.define("antrian.pengaturan.referensi.WorkspaceController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-pengaturan-referensi-workspace",
    onTabChange: function (b, a) {
        if (a.load) {
            a.load({})
        }
    },
    onRefresh: function (a) {
        var d = this;
        d.getView().loadStore({})
    },
    onRequestReport: function (f, d, e) {
        console.log("request");
        this.getView().fireEvent("requestreport", f, d, e)
    }
});
Ext.define("antrian.pengaturan.referensi.antreanblmdilayani.List", {
    extend: "com.Grid",
    alias: "widget.antrian-pengaturan-referensi-antreanblmdilayani-list",
    controller: "antrian-pengaturan-referensi-antreanblmdilayani-list",
    viewModel: {
        stores: {
            store: {
                type: "antrian-hfis-antrean-belumdilayani-store"
            }
        }
    },
    ui: "panel-cyan",
    header: {
        iconCls: "x-fa fa-list",
        padding: "5px 5px 5px 5px",
        title: "Data Antrian Yang Belum Terlayani / Kirim task ID (Min Task 1)",
        items: [{
            xtype: "button",
            ui: "soft-green",
            iconCls: "x-fa fa-refresh",
            tooltip: "Refresh",
            text: "Load",
            listeners: {
                click: "onCari"
            }
        }]
    },
    initComponent: function () {
        var a = this;
        a.plugins = [{
            ptype: "cellediting",
            clicksToEdit: 1
        }], a.columns = [{
            xtype: "rownumberer",
            text: "No",
            align: "left",
            width: 60
        }, {
            text: "Kode Booking",
            width: 120,
            dataIndex: "kodebooking",
            renderer: "onRenderKode",
            editor: {
                readOnly: true,
                selectOnFocus: true
            }
        }, {
            text: "No.Rm",
            width: 100,
            dataIndex: "norekammedis",
            renderer: "onRenderNorm",
            editor: {
                readOnly: true,
                selectOnFocus: true
            }
        }, {
            text: "NIK",
            width: 150,
            dataIndex: "nik",
            renderer: "onRenderNik",
            editor: {
                readOnly: true,
                selectOnFocus: true
            }
        }, {
            text: "No. Kartu",
            width: 150,
            dataIndex: "nokapst",
            renderer: "onRenderNoka",
            editor: {
                readOnly: true,
                selectOnFocus: true
            }
        }, {
            text: "No. HP",
            width: 150,
            dataIndex: "nohp",
            renderer: "onRenderHp",
            editor: {
                readOnly: true,
                selectOnFocus: true
            }
        }, {
            text: "Kode Poli",
            width: 100,
            dataIndex: "kodepoli",
            renderer: "onRenderPoli",
            editor: {
                readOnly: true,
                selectOnFocus: true
            }
        }, {
            text: "No.Antrean",
            width: 100,
            dataIndex: "noantrean",
            renderer: "onRenderAntrean",
            editor: {
                readOnly: true,
                selectOnFocus: true
            }
        }, {
            text: "Dokter",
            width: 100,
            dataIndex: "kodedokter",
            renderer: "onRenderDokter",
            editor: {
                readOnly: true,
                selectOnFocus: true
            }
        }, {
            text: "Jenis Kunjungan",
            width: 100,
            dataIndex: "jeniskunjungan",
            renderer: "onRenderJenis"
        }, {
            text: "Tanggal",
            width: 100,
            dataIndex: "tanggal",
            renderer: "onRenderTanggal"
        }, {
            text: "Jam",
            width: 100,
            dataIndex: "jampraktek",
            renderer: "onRenderJam"
        }, {
            text: "Status",
            width: 100,
            dataIndex: "status",
            renderer: "onRenderStatus"
        }];
        a.callParent(arguments)
    },
    load: function () {
        var b = this,
            a = b.getViewModel().get("store");
        if (a) {
            a.queryParams = {
                loadData: 1
            };
            a.load()
        }
    },
    doAfterLoad: function (g, d, k, b) {
        try {
            if (!k) {
                if (b.error) {
                    var a = b.error.response,
                        h = Ext.JSON.decode(a.responseText),
                        f = h.detail ? (Ext.isObject(h.detail) ? Ext.JSON.encode(h.detail) : h.detail) : "Koneksi Gagal";
                    g.notifyMessage(f, "danger-red")
                }
            }
        } catch (j) {
            g.notifyMessage("Koneksi Gagal", "danger-red")
        }
    }
});
Ext.define("antrian.pengaturan.referensi.antreanblmdilayani.ListController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-pengaturan-referensi-antreanblmdilayani-list",
    kodebooking: "0",
    onRenderKode: function (b, a, e) {
        var d = e.get("kodebooking") ? e.get("kodebooking") : "-";
        return d
    },
    onRenderNorm: function (b, a, e) {
        var d = e.get("norekammedis") ? e.get("norekammedis") : "-";
        return d
    },
    onRenderNik: function (b, a, e) {
        var d = e.get("nik") ? e.get("nik") : "0";
        return d
    },
    onRenderNoka: function (b, a, e) {
        var d = e.get("nokapst") ? e.get("nokapst") : "-";
        return d
    },
    onRenderHp: function (b, a, e) {
        var d = e.get("nohp") ? e.get("nohp") : "-";
        return d
    },
    onRenderPoli: function (b, a, e) {
        var d = e.get("kodepoli") ? e.get("kodepoli") : "-";
        return d
    },
    onRenderDokter: function (b, a, e) {
        var d = e.get("kodedokter") ? e.get("kodedokter") : "-";
        return d
    },
    onRenderAntrean: function (b, a, e) {
        var d = e.get("noantrean") ? e.get("noantrean") : "-";
        return d
    },
    onRenderJenis: function (b, a, e) {
        var d = e.get("jeniskunjungan") ? e.get("jeniskunjungan") : "-";
        return d
    },
    onRenderTanggal: function (b, a, e) {
        var d = e.get("tanggal") ? e.get("tanggal") : "0000-00-00";
        return d
    },
    onRenderJam: function (b, a, e) {
        var d = e.get("jampraktek") ? e.get("jampraktek") : "0000-00-00";
        return d
    },
    onRenderStatus: function (b, a, e) {
        var d = e.get("status") ? e.get("status") : "0000-00-00";
        return d
    },
    onCari: function (a) {
        var b = this;
        b.cari()
    },
    privates: {
        cari: function () {
            var b = this,
                a = b.getView(),
                d = {
                    loadData: 1
                };
            a.setParams({
                loadData: 1
            });
            a.load()
        }
    }
});
Ext.define("antrian.pengaturan.referensi.antreanperjadwal.Detail", {
    extend: "com.Grid",
    alias: "widget.antrian-pengaturan-referensi-antreanperjadwal-detail",
    controller: "antrian-pengaturan-referensi-antreanperjadwal-detail",
    viewModel: {
        stores: {
            store: {
                type: "antrian-hfis-antrean-jadwaldokter-store"
            }
        }
    },
    ui: "panel-cyan",
    header: {
        iconCls: "x-fa fa-list",
        padding: "5px 5px 5px 5px",
        title: "Detail Data Antrian"
    },
    initComponent: function () {
        var a = this;
        a.plugins = [{
            ptype: "cellediting",
            clicksToEdit: 1
        }], a.columns = [{
            xtype: "rownumberer",
            text: "No",
            align: "left",
            width: 60
        }, {
            text: "Kode Booking",
            width: 120,
            dataIndex: "kodebooking",
            renderer: "onRenderKode",
            editor: {
                readOnly: true,
                selectOnFocus: true
            }
        }, {
            text: "No.Rm",
            width: 100,
            dataIndex: "norekammedis",
            renderer: "onRenderNorm",
            editor: {
                readOnly: true,
                selectOnFocus: true
            }
        }, {
            text: "NIK",
            width: 150,
            dataIndex: "nik",
            renderer: "onRenderNik",
            editor: {
                readOnly: true,
                selectOnFocus: true
            }
        }, {
            text: "No. Kartu",
            width: 150,
            dataIndex: "nokapst",
            renderer: "onRenderNoka",
            editor: {
                readOnly: true,
                selectOnFocus: true
            }
        }, {
            text: "No. HP",
            width: 150,
            dataIndex: "nohp",
            renderer: "onRenderHp",
            editor: {
                readOnly: true,
                selectOnFocus: true
            }
        }, {
            text: "Kode Poli",
            width: 100,
            dataIndex: "kodepoli",
            renderer: "onRenderPoli",
            editor: {
                readOnly: true,
                selectOnFocus: true
            }
        }, {
            text: "No.Antrean",
            width: 100,
            dataIndex: "noantrean",
            renderer: "onRenderAntrean",
            editor: {
                readOnly: true,
                selectOnFocus: true
            }
        }, {
            text: "Dokter",
            width: 100,
            dataIndex: "kodedokter",
            renderer: "onRenderDokter",
            editor: {
                readOnly: true,
                selectOnFocus: true
            }
        }, {
            text: "Jenis Kunjungan",
            width: 100,
            dataIndex: "jeniskunjungan",
            renderer: "onRenderJenis"
        }, {
            text: "Tanggal",
            width: 150,
            dataIndex: "tanggal",
            renderer: "onRenderTanggal"
        }, {
            text: "Jam",
            width: 150,
            dataIndex: "jampraktek",
            renderer: "onRenderJam"
        }, {
            text: "Status",
            flex: 1,
            dataIndex: "status",
            renderer: "onRenderStatus"
        }];
        a.callParent(arguments)
    },
    onLoadRecord: function (d) {
        var b = this,
            a = b.getViewModel().get("store");
        a.queryParams = {
            kodepoli: d.get("REFERENSI") ? d.get("REFERENSI").SUBSPESIALIS ? d.get("REFERENSI").SUBSPESIALIS.KDSUBSPESIALIS : "" : "",
            kodedokter: d.get("KD_DOKTER"),
            hari: d.get("HARI"),
            jampraktek: d.get("JAM"),
            loadData: 1
        };
        a.load()
    },
    doAfterLoad: function (g, d, k, b) {
        try {
            if (!k) {
                if (b.error) {
                    var a = b.error.response,
                        h = Ext.JSON.decode(a.responseText),
                        f = h.detail ? (Ext.isObject(h.detail) ? Ext.JSON.encode(h.detail) : h.detail) : "Koneksi Gagal";
                    g.notifyMessage(f, "danger-red")
                }
            }
        } catch (j) {
            g.notifyMessage("Koneksi Gagal", "danger-red")
        }
    }
});
Ext.define("antrian.pengaturan.referensi.antreanperjadwal.DetailController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-pengaturan-referensi-antreanperjadwal-detail",
    onRenderKode: function (b, a, e) {
        var d = e.get("kodebooking") ? e.get("kodebooking") : "-";
        return d
    },
    onRenderNorm: function (b, a, e) {
        var d = e.get("norekammedis") ? e.get("norekammedis") : "-";
        return d
    },
    onRenderNik: function (b, a, e) {
        var d = e.get("nik") ? e.get("nik") : "0";
        return d
    },
    onRenderNoka: function (b, a, e) {
        var d = e.get("nokapst") ? e.get("nokapst") : "-";
        return d
    },
    onRenderHp: function (b, a, e) {
        var d = e.get("nohp") ? e.get("nohp") : "-";
        return d
    },
    onRenderPoli: function (b, a, e) {
        var d = e.get("kodepoli") ? e.get("kodepoli") : "-";
        return d
    },
    onRenderDokter: function (b, a, e) {
        var d = e.get("kodedokter") ? e.get("kodedokter") : "-";
        return d
    },
    onRenderAntrean: function (b, a, e) {
        var d = e.get("noantrean") ? e.get("noantrean") : "-";
        return d
    },
    onRenderJenis: function (b, a, e) {
        var d = e.get("jeniskunjungan") ? e.get("jeniskunjungan") : "-";
        return d
    },
    onRenderTanggal: function (b, a, e) {
        var d = e.get("tanggal") ? e.get("tanggal") : "0000-00-00";
        return d
    },
    onRenderJam: function (b, a, e) {
        var d = e.get("jampraktek") ? e.get("jampraktek") : "0000-00-00";
        return d
    },
    onRenderStatus: function (b, a, e) {
        var d = e.get("status") ? e.get("status") : "0000-00-00";
        return d
    }
});
Ext.define("antrian.pengaturan.referensi.antreanperjadwal.List", {
    extend: "com.Grid",
    alias: "widget.antrian-pengaturan-referensi-antreanperjadwal-list",
    controller: "antrian-pengaturan-referensi-antreanperjadwal-list",
    viewModel: {
        stores: {
            store: {
                type: "antrian-hfis-jadwaldokter-referensi-store"
            }
        }
    },
    ui: "panel-cyan",
    header: {
        iconCls: "x-fa fa-list",
        padding: "5px 5px 5px 5px",
        title: "Data Antrian Per Jadwal Dokter",
        items: [{
            xtype: "antrian-combo-poli-bpjs",
            name: "POLI",
            firstLoad: true,
            reference: "poli",
            margin: "0 5 0 0"
        }, {
            xtype: "combobox",
            name: "hari",
            store: Ext.create("Ext.data.Store", {
                fields: ["id", "name"],
                data: [{
                    id: "1",
                    name: "SENIN"
                }, {
                    id: "2",
                    name: "SELASA"
                }, {
                    id: "3",
                    name: "RABU"
                }, {
                    id: "4",
                    name: "KAMIS"
                }, {
                    id: "5",
                    name: "JUMAT"
                }, {
                    id: "6",
                    name: "SABTU"
                }, {
                    id: "7",
                    name: "MINGGU"
                }]
            }),
            displayField: "name",
            valueField: "id",
            editable: false,
            reference: "hari",
            value: 1,
            margin: "0 5 0 0"
        }, {
            xtype: "button",
            ui: "soft-green",
            iconCls: "x-fa fa-search",
            tooltip: "Filter",
            text: "Filter",
            listeners: {
                click: "onFilterJadwal"
            }
        }]
    },
    initComponent: function () {
        var a = this;
        a.columns = [{
            xtype: "rownumberer",
            text: "No",
            align: "left",
            width: 60
        }, {
            text: "Sub Spesialis",
            flex: 1,
            dataIndex: "NM_SUB_SPESIALIS",
            renderer: "onRenderSubSpesialis"
        }, {
            text: "Piliklinik",
            flex: 1,
            dataIndex: "NM_POLI",
            renderer: "onRenderPoli"
        }, {
            text: "Dokter",
            flex: 2,
            dataIndex: "NM_DOKTER"
        }, {
            text: "Hari",
            width: 100,
            dataIndex: "NM_HARI"
        }, {
            text: "Jam",
            width: 100,
            dataIndex: "JAM"
        }, {
            text: "Data Antrian",
            xtype: "actioncolumn",
            align: "center",
            width: 150,
            items: [{
                xtype: "tool",
                iconCls: "x-fa fa-search",
                tooltip: "Detail Data Antrian Dokter",
                handler: "onViewData"
            }]
        }], a.dockedItems = [{
            xtype: "pagingtoolbar",
            bind: {
                store: "{store}"
            },
            dock: "bottom",
            displayInfo: true,
            items: ["-", {}, {}, {
                xtype: "search-field",
                cls: "x-text-border",
                emptyText: "Cari Nama Dokter",
                margin: "0 5 0 0",
                flex: 1,
                listeners: {
                    search: "onSearch",
                    clear: "onClear"
                }
            }]
        }];
        a.callParent(arguments)
    },
    onLoadRecord: function () {
        var b = this,
            a = b.getViewModel().get("store");
        if (a) {
            a.queryParams = {
                STATUS: 1
            };
            a.load()
        }
    },
    doAfterLoad: function (g, d, k, b) {
        try {
            if (!k) {
                if (b.error) {
                    var a = b.error.response,
                        h = Ext.JSON.decode(a.responseText),
                        f = h.detail ? (Ext.isObject(h.detail) ? Ext.JSON.encode(h.detail) : h.detail) : "Koneksi Gagal";
                    g.notifyMessage(f, "danger-red")
                }
            }
        } catch (j) {
            g.notifyMessage("Koneksi Gagal", "danger-red")
        }
    }
});
Ext.define("antrian.pengaturan.referensi.antreanperjadwal.ListController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-pengaturan-referensi-antreanperjadwal-list",
    onSearch: function (k, g) {
        var h = this,
            j = h.getViewModel(),
            a = j.get("store");
        a.queryParams = {
            QUERY: g,
            STATUS: 1,
            page: 1,
            start: 0
        };
        a.load()
    },
    onClear: function () {
        var e = this,
            f = e.getViewModel(),
            a = f.get("store");
        delete a.queryParams.QUERY;
        delete a.queryParams.page;
        delete a.queryParams.start;
        a.load()
    },
    onFilterJadwal: function (e) {
        var g = this,
            d = g.getReferences(),
            b = g.getViewModel().get("store"),
            f = d.hari.getValue(),
            a = d.poli.getValue();
        b.queryParams = {
            HARI: f,
            poli: a
        };
        b.load()
    },
    onRefresh: function (b) {
        var d = this,
            a = d.getView();
        a.refresh()
    },
    onRenderPoli: function (b, a, e) {
        var d = e.get("REFERENSI") ? e.get("REFERENSI").POLI.KDPOLI + " | " + e.get("REFERENSI").POLI.NMPOLI : "-";
        return d
    },
    onRenderSubSpesialis: function (b, a, e) {
        var d = e.get("REFERENSI") ? e.get("REFERENSI").SUBSPESIALIS.KDSUBSPESIALIS + " | " + e.get("REFERENSI").SUBSPESIALIS.NMSUBSPESIALIS : "-";
        return d
    },
    onCari: function (d) {
        var e = this,
            a = e.getView(),
            b = e.getReferences();
        if (b.kodebooking.getValue() === "") {
            return
        }
        e.query = b.kodebooking.getValue();
        e.cari()
    },
    privates: {
        cari: function () {
            var b = this,
                a = b.getView(),
                d = {
                    kodebooking: b.query,
                    loadData: 1
                };
            if (b.query == "") {
                delete a.getStore().queryParams.kodebooking;
                delete d.kodebooking
            }
            a.setParams({
                kodebooking: b.query,
                loadData: 1
            });
            a.load()
        }
    },
    onViewData: function (d, g, b) {
        var e = this,
            a = e.getView(),
            f = d.getStore().getAt(g);
        if (f) {
            a.openDialog("", true, "100%", "100%", {
                xtype: "antrian-pengaturan-referensi-antreanperjadwal-detail",
                ui: "panel-cyan",
                title: "Data Antrian Dokter",
                showCloseButton: true
            }, function (k, j) {
                var h = j.down("antrian-pengaturan-referensi-antreanperjadwal-detail");
                h.onLoadRecord(f);
                h.on("success", function (l) {
                    d.getStore().reload();
                    j.close()
                })
            }, e, true, false)
        } else {
            a.notifyMessage("Record Not Found")
        }
    }
});
Ext.define("antrian.pengaturan.referensi.antreanperjadwal.Workspace", {
    extend: "com.Form",
    xtype: "antrian-pengaturan-referensi-antreanperjadwal-workspace",
    bodyPadding: 2,
    layout: {
        type: "hbox",
        align: "stretch"
    },
    flex: 1,
    initComponent: function () {
        var a = this;
        a.items = [{
            xtype: "antrian-pengaturan-referensi-antreanperjadwal-list",
            flex: 1,
            reference: "listjadwaldokterhfis"
        }];
        a.callParent(arguments)
    },
    onLoadRecord: function (d) {
        var a = this,
            b = a.down("antrian-pengaturan-referensi-antreanperjadwal-list");
        b.onLoadRecord({})
    }
});
Ext.define("antrian.pengaturan.referensi.antreanperkodebooking.List", {
    extend: "com.Grid",
    alias: "widget.antrian-pengaturan-referensi-antreanperkodebooking-list",
    controller: "antrian-pengaturan-referensi-antreanperkodebooking-list",
    viewModel: {
        stores: {
            store: {
                type: "antrian-hfis-antrean-kodebooking-store",
                queryParams: {
                    kodebooking: "0",
                    loadData: 1
                }
            }
        }
    },
    ui: "panel-cyan",
    header: {
        iconCls: "x-fa fa-list",
        padding: "5px 5px 5px 5px",
        title: "Data Antrian Per Kode Booking",
        items: [{
            xtype: "textfield",
            fieldLabel: "Kode Booking",
            reference: "kodebooking",
            flex: 1
        }, {
            xtype: "button",
            ui: "soft-green",
            iconCls: "x-fa fa-search",
            tooltip: "Cari",
            text: "Cari",
            listeners: {
                click: "onCari"
            }
        }]
    },
    initComponent: function () {
        var a = this;
        a.plugins = [{
            ptype: "cellediting",
            clicksToEdit: 1
        }], a.columns = [{
            xtype: "rownumberer",
            text: "No",
            align: "left",
            width: 60
        }, {
            text: "Kode Booking",
            width: 120,
            dataIndex: "kodebooking",
            renderer: "onRenderKode",
            editor: {
                readOnly: true,
                selectOnFocus: true
            }
        }, {
            text: "No.Rm",
            width: 100,
            dataIndex: "norekammedis",
            renderer: "onRenderNorm",
            editor: {
                readOnly: true,
                selectOnFocus: true
            }
        }, {
            text: "NIK",
            width: 150,
            dataIndex: "nik",
            renderer: "onRenderNik",
            editor: {
                readOnly: true,
                selectOnFocus: true
            }
        }, {
            text: "No. Kartu",
            width: 150,
            dataIndex: "nokapst",
            renderer: "onRenderNoka",
            editor: {
                readOnly: true,
                selectOnFocus: true
            }
        }, {
            text: "No. HP",
            width: 150,
            dataIndex: "nohp",
            renderer: "onRenderHp",
            editor: {
                readOnly: true,
                selectOnFocus: true
            }
        }, {
            text: "Kode Poli",
            width: 100,
            dataIndex: "kodepoli",
            renderer: "onRenderPoli",
            editor: {
                readOnly: true,
                selectOnFocus: true
            }
        }, {
            text: "No.Antrean",
            width: 100,
            dataIndex: "noantrean",
            renderer: "onRenderAntrean",
            editor: {
                readOnly: true,
                selectOnFocus: true
            }
        }, {
            text: "Dokter",
            width: 100,
            dataIndex: "kodedokter",
            renderer: "onRenderDokter",
            editor: {
                readOnly: true,
                selectOnFocus: true
            }
        }, {
            text: "Jenis Kunjungan",
            width: 100,
            dataIndex: "jeniskunjungan",
            renderer: "onRenderJenis"
        }, {
            text: "Tanggal",
            width: 100,
            dataIndex: "tanggal",
            renderer: "onRenderTanggal"
        }, {
            text: "Jam",
            width: 100,
            dataIndex: "jampraktek",
            renderer: "onRenderJam"
        }, {
            text: "Status",
            width: 100,
            dataIndex: "status",
            renderer: "onRenderStatus"
        }];
        a.callParent(arguments)
    },
    onLoadRecord: function () {
        var b = this,
            a = b.getViewModel().get("store");
        if (a) {
            a.queryParams = {
                loadData: 1,
                kodebooking: "0"
            };
            a.load()
        }
    },
    doAfterLoad: function (g, d, k, b) {
        try {
            if (!k) {
                if (b.error) {
                    var a = b.error.response,
                        h = Ext.JSON.decode(a.responseText),
                        f = h.detail ? (Ext.isObject(h.detail) ? Ext.JSON.encode(h.detail) : h.detail) : "Koneksi Gagal";
                    g.notifyMessage(f, "danger-red")
                }
            }
        } catch (j) {
            g.notifyMessage("Koneksi Gagal", "danger-red")
        }
    }
});
Ext.define("antrian.pengaturan.referensi.antreanperkodebooking.ListController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-pengaturan-referensi-antreanperkodebooking-list",
    kodebooking: "0",
    onRenderKode: function (b, a, e) {
        var d = e.get("kodebooking") ? e.get("kodebooking") : "-";
        return d
    },
    onRenderNorm: function (b, a, e) {
        var d = e.get("norekammedis") ? e.get("norekammedis") : "-";
        return d
    },
    onRenderNik: function (b, a, e) {
        var d = e.get("nik") ? e.get("nik") : "0";
        return d
    },
    onRenderNoka: function (b, a, e) {
        var d = e.get("nokapst") ? e.get("nokapst") : "-";
        return d
    },
    onRenderHp: function (b, a, e) {
        var d = e.get("nohp") ? e.get("nohp") : "-";
        return d
    },
    onRenderPoli: function (b, a, e) {
        var d = e.get("kodepoli") ? e.get("kodepoli") : "-";
        return d
    },
    onRenderDokter: function (b, a, e) {
        var d = e.get("kodedokter") ? e.get("kodedokter") : "-";
        return d
    },
    onRenderAntrean: function (b, a, e) {
        var d = e.get("noantrean") ? e.get("noantrean") : "-";
        return d
    },
    onRenderJenis: function (b, a, e) {
        var d = e.get("jeniskunjungan") ? e.get("jeniskunjungan") : "-";
        return d
    },
    onRenderTanggal: function (b, a, e) {
        var d = e.get("tanggal") ? e.get("tanggal") : "0000-00-00";
        return d
    },
    onRenderJam: function (b, a, e) {
        var d = e.get("jampraktek") ? e.get("jampraktek") : "0000-00-00";
        return d
    },
    onRenderStatus: function (b, a, e) {
        var d = e.get("status") ? e.get("status") : "0000-00-00";
        return d
    },
    onCari: function (d) {
        var e = this,
            a = e.getView(),
            b = e.getReferences();
        if (b.kodebooking.getValue() === "") {
            return
        }
        e.query = b.kodebooking.getValue();
        e.cari()
    },
    privates: {
        cari: function () {
            var b = this,
                a = b.getView(),
                d = {
                    kodebooking: b.query,
                    loadData: 1
                };
            if (b.query == "") {
                delete a.getStore().queryParams.kodebooking;
                delete d.kodebooking
            }
            a.setParams({
                kodebooking: b.query,
                loadData: 1
            });
            a.load()
        }
    }
});
Ext.define("antrian.pengaturan.referensi.antreanpertgl.List", {
    extend: "com.Grid",
    alias: "widget.antrian-pengaturan-referensi-antreanpertgl-list",
    controller: "antrian-pengaturan-referensi-antreanpertgl-list",
    viewModel: {
        stores: {
            store: {
                type: "antrian-hfis-antrean-tanggal-store",
                queryParams: {
                    loadData: 1,
                    tanggal: "0000-00-00"
                }
            }
        }
    },
    ui: "panel-cyan",
    header: {
        iconCls: "x-fa fa-list",
        padding: "5px 5px 5px 5px",
        title: "Data Antrian Per Tanggal",
        items: [{
            xtype: "datefield",
            fieldLabel: "Tanggal",
            reference: "tanggal",
            flex: 1
        }, {
            xtype: "button",
            ui: "soft-green",
            iconCls: "x-fa fa-search",
            tooltip: "Cari",
            text: "Cari",
            listeners: {
                click: "onCari"
            }
        }]
    },
    initComponent: function () {
        var a = this;
        a.plugins = [{
            ptype: "cellediting",
            clicksToEdit: 1
        }], a.columns = [{
            xtype: "rownumberer",
            text: "No",
            align: "left",
            width: 60
        }, {
            text: "Kode Booking",
            width: 120,
            dataIndex: "kodebooking",
            renderer: "onRenderKode",
            editor: {
                readOnly: true,
                selectOnFocus: true
            }
        }, {
            text: "No.Rm",
            width: 100,
            dataIndex: "norekammedis",
            renderer: "onRenderNorm",
            editor: {
                readOnly: true,
                selectOnFocus: true
            }
        }, {
            text: "NIK",
            width: 150,
            dataIndex: "nik",
            renderer: "onRenderNik",
            editor: {
                readOnly: true,
                selectOnFocus: true
            }
        }, {
            text: "No. Kartu",
            width: 150,
            dataIndex: "nokapst",
            renderer: "onRenderNoka",
            editor: {
                readOnly: true,
                selectOnFocus: true
            }
        }, {
            text: "No. HP",
            width: 150,
            dataIndex: "nohp",
            renderer: "onRenderHp",
            editor: {
                readOnly: true,
                selectOnFocus: true
            }
        }, {
            text: "Kode Poli",
            width: 100,
            dataIndex: "kodepoli",
            renderer: "onRenderPoli",
            editor: {
                readOnly: true,
                selectOnFocus: true
            }
        }, {
            text: "No.Antrean",
            width: 100,
            dataIndex: "noantrean",
            renderer: "onRenderAntrean",
            editor: {
                readOnly: true,
                selectOnFocus: true
            }
        }, {
            text: "Dokter",
            width: 100,
            dataIndex: "kodedokter",
            renderer: "onRenderDokter",
            editor: {
                readOnly: true,
                selectOnFocus: true
            }
        }, {
            text: "Jenis Kunjungan",
            width: 100,
            dataIndex: "jeniskunjungan",
            renderer: "onRenderJenis"
        }, {
            text: "Tanggal",
            width: 100,
            dataIndex: "tanggal",
            renderer: "onRenderTanggal"
        }, {
            text: "Jam",
            width: 100,
            dataIndex: "jampraktek",
            renderer: "onRenderJam"
        }, {
            text: "Status",
            width: 100,
            dataIndex: "status",
            renderer: "onRenderStatus"
        }];
        a.callParent(arguments)
    },
    onLoadRecord: function () {
        var b = this,
            a = b.getViewModel().get("store");
        if (a) {
            a.queryParams = {
                loadData: 1,
                tanggal: "0000-00-00"
            };
            a.load()
        }
    },
    doAfterLoad: function (g, d, k, b) {
        try {
            if (!k) {
                if (b.error) {
                    var a = b.error.response,
                        h = Ext.JSON.decode(a.responseText),
                        f = h.detail ? (Ext.isObject(h.detail) ? Ext.JSON.encode(h.detail) : h.detail) : "Koneksi Gagal";
                    g.notifyMessage(f, "danger-red")
                }
            }
        } catch (j) {
            g.notifyMessage("Koneksi Gagal", "danger-red")
        }
    }
});
Ext.define("antrian.pengaturan.referensi.antreanpertgl.ListController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-pengaturan-referensi-antreanpertgl-list",
    tanggal: "0000-00-00",
    onRenderKode: function (b, a, e) {
        var d = e.get("kodebooking") ? e.get("kodebooking") : "-";
        return d
    },
    onRenderNorm: function (b, a, e) {
        var d = e.get("norekammedis") ? e.get("norekammedis") : "-";
        return d
    },
    onRenderNik: function (b, a, e) {
        var d = e.get("nik") ? e.get("nik") : "0";
        return d
    },
    onRenderNoka: function (b, a, e) {
        var d = e.get("nokapst") ? e.get("nokapst") : "-";
        return d
    },
    onRenderHp: function (b, a, e) {
        var d = e.get("nohp") ? e.get("nohp") : "-";
        return d
    },
    onRenderPoli: function (b, a, e) {
        var d = e.get("kodepoli") ? e.get("kodepoli") : "-";
        return d
    },
    onRenderDokter: function (b, a, e) {
        var d = e.get("kodedokter") ? e.get("kodedokter") : "-";
        return d
    },
    onRenderAntrean: function (b, a, e) {
        var d = e.get("noantrean") ? e.get("noantrean") : "-";
        return d
    },
    onRenderJenis: function (b, a, e) {
        var d = e.get("jeniskunjungan") ? e.get("jeniskunjungan") : "-";
        return d
    },
    onRenderTanggal: function (b, a, e) {
        var d = e.get("tanggal") ? e.get("tanggal") : "0000-00-00";
        return d
    },
    onRenderJam: function (b, a, e) {
        var d = e.get("jampraktek") ? e.get("jampraktek") : "0000-00-00";
        return d
    },
    onRenderStatus: function (b, a, e) {
        var d = e.get("status") ? e.get("status") : "0000-00-00";
        return d
    },
    onCari: function (d) {
        var e = this,
            a = e.getView(),
            b = e.getReferences();
        if (b.tanggal.getValue() === "") {
            return
        }
        e.query = Ext.util.Format.date(b.tanggal.getValue(), "Y-m-d");
        e.cari()
    },
    privates: {
        cari: function () {
            var b = this,
                a = b.getView(),
                d = {
                    tanggal: b.query,
                    loadData: 1
                };
            if (b.query == "") {
                delete a.getStore().queryParams.tanggal;
                delete d.tanggal
            }
            a.setParams({
                tanggal: b.query,
                loadData: 1
            });
            a.load()
        }
    }
});
Ext.define("antrian.pengaturan.referensi.dashboardbln.List", {
    extend: "com.Grid",
    alias: "widget.antrian-pengaturan-referensi-dashboardbln-list",
    controller: "antrian-pengaturan-referensi-dashboardbln-list",
    viewModel: {
        stores: {
            store: {
                type: "antrian-hfis-dashboard-bulan-store",
                queryParams: {
                    loadData: 1,
                    bulan: (new Date()).getMonth() + 1,
                    tahun: (new Date()).getFullYear()
                }
            }
        }
    },
    ui: "panel-cyan",
    totalantrean: 0,
    header: {
        iconCls: "x-fa fa-list",
        padding: "5px 5px 5px 5px",
        title: "Dashboard Antrian Per Bulan",
        items: [{
            xtype: "combobox",
            name: "bulan",
            store: Ext.create("Ext.data.Store", {
                fields: ["id", "name"],
                data: [{
                    id: "01",
                    name: "Januari"
                }, {
                    id: "02",
                    name: "Februari"
                }, {
                    id: "03",
                    name: "Maret"
                }, {
                    id: "04",
                    name: "April"
                }, {
                    id: "05",
                    name: "Mei"
                }, {
                    id: "06",
                    name: "Juni"
                }, {
                    id: "07",
                    name: "Juli"
                }, {
                    id: "08",
                    name: "Agustus"
                }, {
                    id: "09",
                    name: "September"
                }, {
                    id: "10",
                    name: "Oktober"
                }, {
                    id: "11",
                    name: "Nopember"
                }, {
                    id: "12",
                    name: "Desember"
                }]
            }),
            displayField: "name",
            valueField: "id",
            editable: false,
            reference: "bulan",
            value: (new Date()).getMonth() + 1
        }, {
            xtype: "numberfield",
            name: "tahun",
            reference: "tahun",
            value: (new Date()).getFullYear()
        }, {
            xtype: "button",
            ui: "soft-green",
            iconCls: "x-fa fa-search",
            tooltip: "Cari",
            text: "Cari",
            listeners: {
                click: "onCari"
            }
        }]
    },
    initComponent: function () {
        var a = this;
        a.columns = [{
            xtype: "rownumberer",
            text: "No",
            align: "left",
            width: 60
        }, {
            text: "Kode Poli",
            flex: 0.5,
            dataIndex: "kodepoli",
            renderer: "onRenderKode"
        }, {
            text: "Nama Poli",
            flex: 1,
            dataIndex: "namapoli",
            renderer: "onRenderNmPoli"
        }, {
            text: "Tanggal",
            flex: 1,
            dataIndex: "tanggal",
            renderer: "onRenderTanggal",
            summaryRenderer: "onSummaryInfoRenderer"
        }, {
            text: "Jumlah Antrian",
            flex: 1,
            dataIndex: "jumlah_antrean",
            renderer: "onRenderJumlah",
            summaryRenderer: "onSummaryRenderer"
        }, {
            text: "Rata Task1",
            flex: 1,
            dataIndex: "avg_waktu_task1",
            renderer: "onRenderTask1"
        }, {
            text: "Rata Task2",
            flex: 1,
            dataIndex: "avg_waktu_task2",
            renderer: "onRenderTask2"
        }, {
            text: "Rata Task3",
            flex: 1,
            dataIndex: "avg_waktu_task3",
            renderer: "onRenderTask3"
        }, {
            text: "Rata Task4",
            flex: 1,
            dataIndex: "avg_waktu_task4",
            renderer: "onRenderTask4"
        }, {
            text: "Rata Task5",
            flex: 1,
            dataIndex: "avg_waktu_task5",
            renderer: "onRenderTask5"
        }, {
            text: "Rata Task6",
            flex: 1,
            dataIndex: "avg_waktu_task6",
            renderer: "onRenderTask6"
        }], a.features = [{
            ftype: "summary",
            dock: "bottom"
        }];
        a.callParent(arguments)
    },
    onLoadRecord: function () {
        var b = this,
            a = b.getViewModel().get("store");
        if (a) {
            a.queryParams = {
                loadData: 1,
                bulan: (new Date()).getMonth() + 1,
                tahun: (new Date()).getFullYear()
            };
            a.load()
        }
    },
    doAfterLoad: function (k, a, g, d) {
        try {
            if (!g) {
                if (d.error) {
                    var f = d.error.response,
                        b = Ext.JSON.decode(f.responseText),
                        h = b.detail ? (Ext.isObject(b.detail) ? Ext.JSON.encode(b.detail) : b.detail) : "Koneksi Gagal";
                    k.notifyMessage(h, "danger-red")
                }
            } else {
                var l = 0;
                a.forEach(function (e) {
                    l = parseInt(l) + parseInt(e.get("jumlah_antrean"))
                });
                k.totalantrean = l
            }
        } catch (j) {
            console.log(j);
            k.notifyMessage("Koneksi Gagal", "danger-red")
        }
    }
});
Ext.define("antrian.pengaturan.referensi.dashboardbln.ListController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-pengaturan-referensi-dashboardbln-list",
    bulan: "01",
    tahun: "2000",
    jumlah: 0,
    onRenderKode: function (b, a, e) {
        var d = e.get("kodepoli") ? e.get("kodepoli") : "-";
        return d
    },
    onRenderNmPoli: function (b, a, e) {
        var d = e.get("namapoli") ? e.get("namapoli") : "-";
        return d
    },
    onRenderJumlah: function (d, b, e) {
        var a = e.get("jumlah_antrean") ? e.get("jumlah_antrean") : 0;
        this.jumlah = this.jumlah + a;
        return a
    },
    onRenderTask1: function (b, a, e) {
        var d = e.get("avg_waktu_task1") ? e.get("avg_waktu_task1") : "-";
        return d
    },
    onRenderTask2: function (b, a, e) {
        var d = e.get("avg_waktu_task2") ? e.get("avg_waktu_task2") : "-";
        return d
    },
    onRenderTask3: function (b, a, e) {
        var d = e.get("avg_waktu_task3") ? e.get("avg_waktu_task3") : "-";
        return d
    },
    onRenderTask4: function (b, a, e) {
        var d = e.get("avg_waktu_task4") ? e.get("avg_waktu_task4") : "-";
        return d
    },
    onRenderTask5: function (b, a, e) {
        var d = e.get("avg_waktu_task5") ? e.get("avg_waktu_task5") : "-";
        return d
    },
    onRenderTask6: function (b, a, e) {
        var d = e.get("avg_waktu_task6") ? e.get("avg_waktu_task6") : "-";
        return d
    },
    onRenderTanggal: function (b, a, e) {
        var d = e.get("tanggal") ? e.get("tanggal") : "0000-00-00";
        return d
    },
    onSummaryInfoRenderer: function () {
        return '<span style="font-size: 12px; font-weight: bold">Total : </span>'
    },
    onSummaryRenderer: function (e, b, d) {
        var a = '<span style="font-size: 12px; font-weight: bold">' + Ext.util.Format.number(this.getView().totalantrean, "0,00") + "</span>";
        return a
    },
    onCari: function (b) {
        var d = this,
            a = d.getReferences();
        if (a.bulan.getValue() === "") {
            return
        }
        if (a.tahun.getValue() === "") {
            return
        }
        d.jumlah = 0;
        d.bulan = a.bulan.getValue();
        d.tahun = a.tahun.getValue();
        d.cari()
    },
    privates: {
        cari: function () {
            var b = this,
                a = b.getView(),
                d = {
                    bulan: b.bulan,
                    tahun: b.tahun,
                    loadData: 1
                };
            if (b.bulan == "") {
                delete a.getStore().queryParams.bulan;
                delete d.bulan
            }
            if (b.tahun == "") {
                delete a.getStore().queryParams.tahun;
                delete d.tahun
            }
            a.setParams({
                bulan: b.bulan,
                tahun: b.tahun,
                loadData: 1
            });
            a.load()
        }
    }
});
Ext.define("antrian.pengaturan.referensi.dashboardtgl.List", {
    extend: "com.Grid",
    alias: "widget.antrian-pengaturan-referensi-dashboardtgl-list",
    controller: "antrian-pengaturan-referensi-dashboardtgl-list",
    viewModel: {
        stores: {
            store: {
                type: "antrian-hfis-dashboard-tanggal-store",
                queryParams: {
                    loadData: 1,
                    tanggal: "0000-00-00"
                }
            }
        },
        data: {
            total: 1
        }
    },
    ui: "panel-cyan",
    header: {
        iconCls: "x-fa fa-list",
        padding: "5px 5px 5px 5px",
        title: "Dashboard Antrian Per Tanggal",
        items: [{
            xtype: "datefield",
            fieldLabel: "Tanggal",
            reference: "tanggal",
            flex: 1
        }, {
            xtype: "button",
            ui: "soft-green",
            iconCls: "x-fa fa-search",
            tooltip: "Cari",
            text: "Cari",
            listeners: {
                click: "onCari"
            }
        }]
    },
    initComponent: function () {
        var a = this;
        a.columns = [{
            xtype: "rownumberer",
            text: "No",
            align: "left",
            width: 60
        }, {
            text: "Kode Poli",
            flex: 0.5,
            dataIndex: "kodepoli",
            renderer: "onRenderKode"
        }, {
            text: "Nama Poli",
            flex: 1,
            dataIndex: "namapoli",
            renderer: "onRenderNmPoli"
        }, {
            text: "Tanggal",
            flex: 1,
            dataIndex: "tanggal",
            renderer: "onRenderTanggal",
            summaryRenderer: "onSummaryInfoRenderer"
        }, {
            text: "Jumlah Antrian",
            flex: 1,
            dataIndex: "jumlah",
            renderer: "onRenderJumlah",
            summaryRenderer: "onSummaryRenderer"
        }, {
            text: "Rata Task1",
            flex: 1,
            dataIndex: "avg_waktu_task1",
            renderer: "onRenderTask1"
        }, {
            text: "Rata Task2",
            flex: 1,
            dataIndex: "avg_waktu_task2",
            renderer: "onRenderTask2"
        }, {
            text: "Rata Task3",
            flex: 1,
            dataIndex: "avg_waktu_task3",
            renderer: "onRenderTask3"
        }, {
            text: "Rata Task4",
            flex: 1,
            dataIndex: "avg_waktu_task4",
            renderer: "onRenderTask4"
        }, {
            text: "Rata Task5",
            flex: 1,
            dataIndex: "avg_waktu_task5",
            renderer: "onRenderTask5"
        }, {
            text: "Rata Task6",
            flex: 1,
            dataIndex: "avg_waktu_task6",
            renderer: "onRenderTask6"
        }], a.features = [{
            ftype: "summary",
            dock: "bottom"
        }];
        a.callParent(arguments)
    },
    onLoadRecord: function () {
        var b = this,
            a = b.getViewModel().get("store");
        if (a) {
            a.queryParams = {
                loadData: 1,
                tanggal: "0000-00-00"
            };
            a.load()
        }
    },
    doAfterLoad: function (g, d, k, b) {
        try {
            if (!k) {
                if (b.error) {
                    var a = b.error.response,
                        h = Ext.JSON.decode(a.responseText),
                        f = h.detail ? (Ext.isObject(h.detail) ? Ext.JSON.encode(h.detail) : h.detail) : "Koneksi Gagal";
                    g.notifyMessage(f, "danger-red")
                }
            }
        } catch (j) {
            g.notifyMessage("Koneksi Gagal", "danger-red")
        }
    }
});
Ext.define("antrian.pengaturan.referensi.dashboardtgl.ListController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-pengaturan-referensi-dashboardtgl-list",
    kodebooking: "0000-00-00",
    jumlah: 0,
    onRenderKode: function (b, a, e) {
        var d = e.get("kodepoli") ? e.get("kodepoli") : "-";
        return d
    },
    onRenderNmPoli: function (b, a, e) {
        var d = e.get("namapoli") ? e.get("namapoli") : "-";
        return d
    },
    onRenderJumlah: function (d, b, e) {
        var a = e.get("jumlah_antrean") ? e.get("jumlah_antrean") : "0";
        this.jumlah = this.jumlah + a;
        return a
    },
    onRenderTask1: function (b, a, e) {
        var d = e.get("avg_waktu_task1") ? e.get("avg_waktu_task1") : "-";
        return d
    },
    onRenderTask2: function (b, a, e) {
        var d = e.get("avg_waktu_task2") ? e.get("avg_waktu_task2") : "-";
        return d
    },
    onRenderTask3: function (b, a, e) {
        var d = e.get("avg_waktu_task3") ? e.get("avg_waktu_task3") : "-";
        return d
    },
    onRenderTask4: function (b, a, e) {
        var d = e.get("avg_waktu_task4") ? e.get("avg_waktu_task4") : "-";
        return d
    },
    onRenderTask5: function (b, a, e) {
        var d = e.get("avg_waktu_task5") ? e.get("avg_waktu_task5") : "-";
        return d
    },
    onRenderTask6: function (b, a, e) {
        var d = e.get("avg_waktu_task6") ? e.get("avg_waktu_task6") : "-";
        return d
    },
    onRenderTanggal: function (b, a, e) {
        var d = e.get("tanggal") ? e.get("tanggal") : "0000-00-00";
        return d
    },
    onSummaryInfoRenderer: function () {
        return '<span style="font-size: 12px; font-weight: bold">Total : </span>'
    },
    onSummaryRenderer: function (g, b, d) {
        var f = this,
            e = f.getView().getViewModel().get("total");
        var a = '<span style="font-size: 12px; font-weight: bold">' + Ext.util.Format.number(this.jumlah, "0,00") + "</span>";
        return a
    },
    onCari: function (b) {
        var d = this,
            a = d.getReferences();
        if (a.tanggal.getValue() === "") {
            return
        }
        d.jumlah = 0;
        d.query = Ext.util.Format.date(a.tanggal.getValue(), "Y-m-d");
        d.cari()
    },
    privates: {
        cari: function () {
            var b = this,
                a = b.getView(),
                d = {
                    tanggal: b.query,
                    loadData: 1
                };
            a.getViewModel().set("total", 54321);
            if (b.query == "") {
                delete a.getStore().queryParams.tanggal;
                delete d.tanggal
            }
            a.setParams({
                tanggal: b.query,
                loadData: 1
            });
            a.load()
        }
    }
});
Ext.define("antrian.pengaturan.referensi.dokter.List", {
    extend: "com.Grid",
    alias: "widget.antrian-pengaturan-referensi-dokter-list",
    controller: "antrian-pengaturan-referensi-dokter-list",
    viewModel: {
        stores: {
            store: {
                type: "antrian-hfis-dokter-store"
            }
        }
    },
    ui: "panel-cyan",
    header: {
        iconCls: "x-fa fa-list",
        padding: "5px 5px 5px 5px",
        title: "Referensi Dokter (By: Mobile JKN)",
        items: [{
            xtype: "button",
            ui: "soft-blue",
            iconCls: "x-fa fa-refresh",
            tooltip: "Ambil Referensi Dokter Dari Mobile JKN",
            text: "Ambil Referensi Dokter",
            listeners: {
                click: "onGetDokter"
            }
        }, {
            xtype: "button",
            ui: "soft-green",
            iconCls: "x-fa fa-refresh",
            tooltip: "Load",
            text: "Refresh List",
            listeners: {
                click: "onRefresh"
            }
        }]
    },
    initComponent: function () {
        var a = this;
        a.columns = [{
            xtype: "rownumberer",
            text: "No",
            align: "left",
            width: 60
        }, {
            text: "Kode",
            flex: 1,
            dataIndex: "KODE",
            renderer: "onRenderKode"
        }, {
            text: "Nama",
            flex: 2,
            dataIndex: "NAMA",
            renderer: "onRenderNama"
        }, {
            xtype: "checkcolumn",
            header: "STATUS",
            dataIndex: "STATUS",
            width: 90,
            listeners: {
                checkchange: "onChange"
            }
        }], a.dockedItems = [{
            xtype: "pagingtoolbar",
            bind: {
                store: "{store}"
            },
            dock: "bottom",
            displayInfo: true,
            items: ["-", {}, {}, {
                xtype: "search-field",
                cls: "x-text-border",
                autoFocus: true,
                emptyText: "Cari Nama Dokter",
                flex: 3,
                listeners: {
                    search: "onsearch",
                    clear: "onClear"
                }
            }, {
                xtype: "combobox",
                reference: "statusdokter",
                store: Ext.create("Ext.data.Store", {
                    fields: ["id", "desk"],
                    data: [{
                        id: 1,
                        desk: "Aktif"
                    }, {
                        id: 0,
                        desk: "Tidak Aktif"
                    }]
                }),
                queryMode: "local",
                displayField: "desk",
                flex: 1,
                valueField: "id",
                value: 1,
                editable: false,
                listeners: {
                    select: "onSelectStatus"
                }
            }]
        }];
        a.callParent(arguments)
    },
    onLoadRecord: function () {
        var b = this,
            a = b.getViewModel().get("store");
        if (a) {
            a.queryParams = {
                loadData: 1
            };
            a.load()
        }
    },
    doAfterLoad: function (g, d, k, b) {
        try {
            if (!k) {
                if (b.error) {
                    var a = b.error.response,
                        h = Ext.JSON.decode(a.responseText),
                        f = h.detail ? (Ext.isObject(h.detail) ? Ext.JSON.encode(h.detail) : h.detail) : "Koneksi Gagal";
                    g.notifyMessage(f, "danger-red")
                }
            }
        } catch (j) {
            g.notifyMessage("Koneksi Gagal", "danger-red")
        }
    }
});
Ext.define("antrian.pengaturan.referensi.dokter.ListController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-pengaturan-referensi-dokter-list",
    query: "",
    status: 1,
    onChange: function (n, a, j) {
        var k = this,
            h = k.getView(),
            l = k.getViewModel(),
            o = l.get("store"),
            m = o.getAt(a);
        record = Ext.create("antrian.hfis.dokter.Model", {});
        record.set("KODE", m.get("KODE"));
        record.set("UBAH_STATUS", 1);
        record.set("STATUS", j ? 1 : 0);
        record.scope = this;
        record.save({
            callback: function (d, e, b) {
                if (b) {
                    h.notifyMessage("Status di" + (j == true ? "Aktifkan" : "Non Aktifkan"), "danger-blue");
                    h.reload()
                }
            }
        })
    },
    onGetDokter: function (b) {
        var d = this,
            a = d.getViewModel().get("store");
        a.queryParams = {
            sendToWs: 1
        };
        a.load()
    },
    onRefresh: function (b) {
        var d = this,
            a = d.getViewModel().get("store");
        a.queryParams = {
            loadData: 1
        };
        a.load()
    },
    onRenderKode: function (b, a, e) {
        var d = e.get("KODE") ? e.get("KODE") : "-";
        return d
    },
    onRenderNama: function (b, a, e) {
        var d = e.get("NAMA") ? e.get("NAMA") : "-";
        return d
    },
    onsearch: function (b, a) {
        this.query = a;
        this.cari()
    },
    onClear: function () {
        this.query = "";
        this.cari()
    },
    onSelectStatus: function (b, a) {
        if (a) {
            this.status = a.get("id")
        }
        this.cari()
    },
    privates: {
        cari: function () {
            var d = this,
                a = d.getView(),
                b = a.down("pagingtoolbar"),
                e = {
                    QUERY: d.query,
                    STATUS: d.status,
                    loadData: 1
                };
            if (d.query == "") {
                delete a.getStore().queryParams.QUERY;
                delete e.QUERY
            }
            if (d.status == "") {
                delete a.getStore().queryParams.STATUS;
                delete e.STATUS
            }
            a.setParams({
                QUERY: d.query,
                STATUS: d.status,
                loadData: 1
            });
            if (b) {
                b.moveFirst()
            } else {
                a.load()
            }
        }
    }
});
Ext.define("antrian.pengaturan.referensi.dokter.Workspace", {
    extend: "com.Form",
    xtype: "antrian-pengaturan-referensi-dokter-workspace",
    bodyPadding: 2,
    layout: {
        type: "hbox",
        align: "stretch"
    },
    flex: 1,
    initComponent: function () {
        var a = this;
        a.items = [{
            xtype: "antrian-pengaturan-referensi-dokter-list",
            flex: 1,
            reference: "listrefdokter"
        }];
        a.callParent(arguments)
    },
    onLoadRecord: function (d) {
        var a = this,
            b = a.down("antrian-pengaturan-referensi-dokter-list");
        b.onLoadRecord({})
    }
});
Ext.define("antrian.pengaturan.referensi.persentase.Form", {
    extend: "com.Form",
    alias: "widget.antrian-pengaturan-referensi-persentase-form",
    controller: "antrian-pengaturan-referensi-persentase-form",
    viewModel: {
        stores: {
            store: {
                type: "antrian-hfis-dashboard-grafik-local-store"
            }
        }
    },
    layout: {
        type: "hbox",
        align: "stretch"
    },
    initComponent: function () {
        var a = this;
        a.items = [{
            border: true,
            xtype: "polar",
            theme: "default-gradients",
            flex: 1,
            insetPadding: 40,
            innerPadding: 20,
            bind: {
                store: "{store}"
            },
            legend: {
                docked: "bottom"
            },
            colors: ["#f44336", "#03a9f4", "#9c27b0", "#673ab7", "#3f51b5"],
            interactions: ["rotate"],
            series: [{
                type: "pie",
                angleField: "PERSENTASE",
                label: {
                    field: "DESKRIPSI",
                    calloutLine: {
                        length: 60,
                        width: 3
                    }
                },
                highlight: true,
                tooltip: {
                    trackMouse: true,
                    renderer: "onSeriesTooltipRender"
                }
            }]
        }];
        a.callParent(arguments)
    },
    load: function (d) {
        var b = this,
            a = b.getViewModel().get("store");
        if (a) {
            b.setLoading(true);
            a.removeAll();
            a.queryParams = {
                loadData: 1,
                SUMBER: d.SUMBER,
                PAWAL: d.PAWAL,
                PAKHIR: d.PAKHIR
            };
            a.load({
                callback: function (f, e, g) {
                    b.setLoading(false)
                }
            })
        }
    }
});
Ext.define("antrian.pengaturan.referensi.persentase.FormController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-pengaturan-referensi-persentase-form",
    onSeriesTooltipRender: function (d, a, b) {
        d.setHtml(a.get("DESKRIPSI") + " : " + a.get("JUMLAH") + " ( " + a.get("PERSENTASE") + "% ) Dari " + a.get("JMLSEP") + " SEP Terbit")
    }
});
Ext.define("antrian.pengaturan.referensi.persentase.List", {
    extend: "com.Grid",
    alias: "widget.antrian-pengaturan-referensi-persentase-list",
    viewModel: {
        stores: {
            store: {
                type: "antrian-hfis-dashboard-grafik-local-store"
            }
        }
    },
    initComponent: function () {
        var a = this;
        a.columns = [{
            xtype: "rownumberer",
            text: "No",
            align: "left",
            width: 60
        }, {
            text: "Deskripsi",
            flex: 3,
            dataIndex: "DESKRIPSI"
        }, {
            text: "Jumlah",
            flex: 1,
            align: "right",
            dataIndex: "JUMLAH"
        }, {
            text: "Persentase (%)",
            flex: 1,
            align: "right",
            dataIndex: "PERSENTASE"
        }, {
            text: "Jumlah SEP Terbit",
            flex: 1,
            align: "right",
            dataIndex: "JMLSEP"
        }];
        a.callParent(arguments)
    },
    load: function (d) {
        var b = this,
            a = b.getViewModel().get("store");
        if (a) {
            b.setLoading(true);
            a.removeAll();
            a.setQueryParams(d);
            a.load({
                callback: function (f, e, g) {
                    b.setLoading(false)
                }
            })
        }
    }
});
Ext.define("antrian.pengaturan.referensi.persentase.Workspace", {
    extend: "com.Form",
    xtype: "antrian-pengaturan-referensi-persentase-workspace",
    controller: "antrian-pengaturan-referensi-persentase-workspace",
    layout: "border",
    bodyPadding: 0,
    ui: "panel-cyan",
    header: {
        iconCls: "x-fa fa-list",
        padding: "5px 5px 5px 5px",
        title: "Grafik Persentase Antrian Berdasarkan SEP Terbit",
        items: [{
            xtype: "combo",
            margin: "0 5 0 0",
            store: Ext.create("data.store.Store", {
                fields: ["ID", "DESKRIPSI"],
                data: [{
                    ID: 0,
                    DESKRIPSI: "Local"
                }, {
                    ID: 1,
                    DESKRIPSI: "Mobile JKN"
                }]
            }),
            value: 0,
            reference: "sumberdata",
            displayField: "DESKRIPSI",
            valueField: "ID",
            emptyText: "[ Sumber Data ]",
            listeners: {
                select: "onSelectJenis"
            }
        }, {
            xtype: "combo",
            margin: "0 5 0 0",
            store: Ext.create("data.store.Store", {
                fields: ["ID", "DESKRIPSI"],
                data: [{
                    ID: 0,
                    DESKRIPSI: "Grafik"
                }, {
                    ID: 1,
                    DESKRIPSI: "Grid / List"
                }]
            }),
            value: 0,
            displayField: "DESKRIPSI",
            valueField: "ID",
            emptyText: "[ Jenis Garfik ]",
            listeners: {
                select: "onSelectView"
            }
        }, {
            xtype: "datefield",
            margin: "0 5 0 0",
            reference: "tanggalmulai"
        }, {
            xtype: "datefield",
            margin: "0 5 0 0",
            reference: "tanggalselesai"
        }, {
            xtype: "button",
            ui: "soft-green",
            iconCls: "x-fa fa-search",
            tooltip: "Cari",
            text: "Cari",
            listeners: {
                click: "onCari"
            }
        }]
    },
    items: [{
        region: "center",
        flex: 1,
        reference: "formgrafik",
        layout: {
            type: "card",
            align: "stretch"
        },
        bodyPadding: 0,
        items: [{
            flex: 1,
            bodyPadding: 0,
            xtype: "antrian-pengaturan-referensi-persentase-form"
        }, {
            flex: 1,
            bodyPadding: 0,
            xtype: "antrian-pengaturan-referensi-persentase-list"
        }]
    }],
    load: function () {
        var g = this,
            f = g.down("[reference = tanggalmulai]"),
            a = g.down("[reference = tanggalselesai]"),
            e = g.down("[reference = sumberdata]"),
            d = g.down("[reference = formgrafik]").getLayout(),
            b = d.getActiveItem(),
            h = {
                loadGrafik: 1,
                SUMBER: e.getValue(),
                PAWAL: (f.getValue()) ? Ext.Date.format(f.getValue(), "Y-m-d 00:00:00") : Ext.Date.format(g.getSysdate(), "Y-m-d 00:00:00"),
                PAKHIR: (a.getValue()) ? Ext.Date.format(a.getValue(), "Y-m-d 23:59:59") : Ext.Date.format(g.getSysdate(), "Y-m-d 23:59:59")
            };
        if (!f.getValue()) {
            f.setValue(g.getSysdate())
        }
        if (!a.getValue()) {
            a.setValue(g.getSysdate())
        }
        b.load(h)
    }
});
Ext.define("antrian.pengaturan.referensi.persentase.WorkspaceController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-pengaturan-referensi-persentase-workspace",
    onCari: function (a) {
        var b = this;
        b.getView().load()
    },
    onSelectJenis: function (b, e) {
        var d = this,
            a = d.getView();
        a.load()
    },
    onSelectView: function (d, g) {
        var f = this,
            a = f.getView(),
            b = f.getReferences(),
            e = b.formgrafik.getLayout();
        e.setActiveItem(g.get("ID"));
        a.load()
    }
});
Ext.define("antrian.pengaturan.referensi.taskid.List", {
    extend: "com.Grid",
    alias: "widget.antrian-pengaturan-referensi-taskid-list",
    controller: "antrian-pengaturan-referensi-taskid-list",
    viewModel: {
        stores: {
            store: {
                type: "antrian-hfis-taskid-store",
                queryParams: {
                    kodebooking: "0",
                    loadData: 1
                }
            }
        }
    },
    ui: "panel-cyan",
    header: {
        iconCls: "x-fa fa-list",
        padding: "5px 5px 5px 5px",
        title: "List Task Id Antrean",
        items: [{
            xtype: "textfield",
            fieldLabel: "Kode Booking",
            reference: "kodebooking",
            flex: 1
        }, {
            xtype: "button",
            ui: "soft-green",
            iconCls: "x-fa fa-search",
            tooltip: "Cari",
            text: "Cari",
            listeners: {
                click: "onCari"
            }
        }]
    },
    initComponent: function () {
        var a = this;
        a.columns = [{
            xtype: "rownumberer",
            text: "No",
            align: "left",
            width: 60
        }, {
            text: "Kode Booking",
            flex: 1,
            dataIndex: "kodebooking",
            renderer: "onRenderKode"
        }, {
            text: "Task",
            flex: 0.5,
            dataIndex: "taskid",
            renderer: "onRenderTask"
        }, {
            text: "Waktu",
            flex: 1,
            dataIndex: "waktu",
            renderer: "onRenderWaktu"
        }, {
            text: "Waktu RS",
            flex: 1,
            dataIndex: "wakturs",
            renderer: "onRenderWaktuRs"
        }, {
            text: "Keterangan",
            flex: 2,
            dataIndex: "taskname",
            renderer: "onRenderTaskName"
        }];
        a.callParent(arguments)
    },
    onLoadRecord: function () {
        var b = this,
            a = b.getViewModel().get("store");
        if (a) {
            a.queryParams = {
                kodebooking: "0",
                loadData: 1
            };
            a.load()
        }
    },
    doAfterLoad: function (g, d, k, b) {
        try {
            if (!k) {
                if (b.error) {
                    var a = b.error.response,
                        h = Ext.JSON.decode(a.responseText),
                        f = h.detail ? (Ext.isObject(h.detail) ? Ext.JSON.encode(h.detail) : h.detail) : "Koneksi Gagal";
                    g.notifyMessage(f, "danger-red")
                }
            }
        } catch (j) {
            g.notifyMessage("Koneksi Gagal", "danger-red")
        }
    }
});
Ext.define("antrian.pengaturan.referensi.taskid.ListController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-pengaturan-referensi-taskid-list",
    kodebooking: "",
    onRenderKode: function (b, a, e) {
        var d = e.get("kodebooking") ? e.get("kodebooking") : "-";
        return d
    },
    onRenderTask: function (b, a, e) {
        var d = e.get("taskid") ? e.get("taskid") : "-";
        return d
    },
    onRenderWaktu: function (b, a, e) {
        var d = e.get("waktu") ? e.get("waktu") : "-";
        return d
    },
    onRenderWaktuRs: function (b, a, e) {
        var d = e.get("wakturs") ? e.get("wakturs") : "-";
        return d
    },
    onRenderTaskName: function (b, a, e) {
        var d = e.get("taskname") ? e.get("taskname") : "-";
        return d
    },
    onCari: function (d) {
        var e = this,
            a = e.getView(),
            b = e.getReferences();
        if (b.kodebooking.getValue() === "") {
            return
        }
        e.query = b.kodebooking.getValue();
        e.cari()
    },
    privates: {
        cari: function () {
            var b = this,
                a = b.getView(),
                d = {
                    kodebooking: b.query,
                    loadData: 1
                };
            if (b.query == "") {
                delete a.getStore().queryParams.kodebooking;
                delete d.kodebooking
            }
            a.setParams({
                kodebooking: b.query,
                loadData: 1
            });
            a.load()
        }
    }
});
Ext.define("antrian.pengaturan.rsonline.monitoring.Form", {
    extend: "com.Form",
    xtype: "antrian-pengaturan-rsonline-monitoring-form",
    requires: ["Ext.picker.Time"],
    controller: "antrian-pengaturan-rsonline-monitoring-form",
    layout: {
        type: "hbox"
    },
    initComponent: function () {
        var a = this;
        a.items = [{
            xtype: "button",
            text: "Kirim Antrian",
            ui: "soft-blue",
            handler: "onKirimAntrian",
            margin: "0 10 0 0"
        }, {
            xtype: "button",
            text: "Task (1)",
            ui: "soft-green",
            value: 1,
            handler: "onUpdateWaktuTunggu",
            margin: "0 10 0 0"
        }, {
            xtype: "button",
            text: "Task (2)",
            ui: "soft-green",
            value: 2,
            handler: "onUpdateWaktuTunggu",
            margin: "0 10 0 0"
        }, {
            xtype: "button",
            text: "Task (3)",
            ui: "soft-green",
            value: 3,
            handler: "onUpdateWaktuTunggu",
            margin: "0 10 0 0"
        }, {
            xtype: "button",
            text: "Task (4)",
            ui: "soft-green",
            value: 4,
            handler: "onUpdateWaktuTunggu",
            margin: "0 10 0 0"
        }, {
            xtype: "button",
            text: "Task (5)",
            ui: "soft-green",
            value: 5,
            handler: "onUpdateWaktuTunggu",
            margin: "0 10 0 0"
        }, {
            xtype: "button",
            text: "Task (6)",
            ui: "soft-green",
            value: 6,
            handler: "onUpdateWaktuTunggu",
            margin: "0 10 0 0"
        }, {
            xtype: "button",
            text: "Task (7)",
            ui: "soft-green",
            value: 7,
            handler: "onUpdateWaktuTunggu",
            margin: "0 10 0 0"
        }, {
            xtype: "button",
            text: "Batalkan",
            ui: "soft-red",
            handler: "onBatalAntrian",
            margin: "0 10 0 0"
        }];
        a.callParent(arguments)
    },
    onLoadRecord: function (d) {
        var b = this,
            a = b.getSysdate()
    }
});
Ext.define("antrian.pengaturan.rsonline.monitoring.FormController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-pengaturan-rsonline-monitoring-form",
    onKirimAntrian: function (b) {
        var d = this,
            a = d.getView();
        a.fireEvent("kirimantrian")
    },
    onUpdateWaktuTunggu: function (d) {
        var e = this,
            a = e.getView(),
            b = d.getValue();
        a.fireEvent("updatewaktutunggu", b)
    },
    onBatalAntrian: function (b) {
        var d = this,
            a = d.getView();
        a.fireEvent("batalantrian", 99)
    }
});
Ext.define("antrian.pengaturan.rsonline.monitoring.List", {
    extend: "com.Grid",
    alias: "widget.antrian-pengaturan-rsonline-monitoring-list",
    controller: "antrian-pengaturan-rsonline-monitoring-list",
    viewModel: {
        stores: {
            store: {
                type: "antrian-kirimantrian-rsonline-db-store"
            }
        }
    },
    penggunaAksesPos: [],
    ui: "panel-cyan",
    header: {
        iconCls: "x-fa fa-list",
        padding: "5px 5px 5px 5px",
        title: "Monitoring Status Kirim Ke RSONLINE",
        items: [{
            xtype: "combobox",
            name: "POS_ANTRIAN",
            allowBlank: false,
            enterFocus: true,
            reference: "posantrian",
            enforceMaxLength: true,
            forceSelection: true,
            validateOnBlur: true,
            displayField: "DESKRIPSI",
            valueField: "NOMOR",
            queryMode: "local",
            margin: "0 5 0 0",
            typeAhead: true,
            emptyText: "[ Pilih Pos Antrian ]",
            store: {
                model: "data.model.Kategori"
            }
        }, {
            xtype: "datefield",
            name: "TANGGAL",
            format: "d-m-Y",
            reference: "tanggal",
            margin: "0 5 0 0"
        }, {
            xtype: "button",
            ui: "soft-green",
            iconCls: "x-fa fa-refresh",
            tooltip: "Filter Data Antrian",
            text: "Filter",
            listeners: {
                click: "onFilterAntrian"
            }
        }]
    },
    initComponent: function () {
        var a = this;
        a.cellEditing = new Ext.grid.plugin.CellEditing({
            clicksToEdit: 1,
            listeners: {
                beforeedit: "beforeEdit"
            }
        });
        a.plugins = [a.cellEditing];
        a.columnLines = true, a.selModel = {
            type: "checkboxmodel",
            checkOnly: true
        };
        a.columns = [{
            text: "No.Antrian",
            dataIndex: "angkaantrean",
            menuDisabled: true,
            sortable: false,
            align: "left",
            width: 100,
            renderer: "onAntrian"
        }, {
            text: "No.RM",
            dataIndex: "norm",
            menuDisabled: true,
            sortable: false,
            align: "left",
            width: 100,
            renderer: "onRm",
            editor: {
                xtype: "textfield",
                emptyText: "Norm",
                name: "norm",
                readonly: true
            }
        }, {
            text: "No.Kartu",
            dataIndex: "nomorkartu",
            menuDisabled: true,
            sortable: false,
            align: "left",
            width: 100,
            renderer: "onKartu",
            editor: {
                xtype: "textfield",
                emptyText: "No.Kartu",
                name: "nomorkartu",
                readonly: true
            }
        }, {
            text: "Poli Tujuan",
            dataIndex: "kodepoli",
            menuDisabled: true,
            sortable: false,
            align: "left",
            width: 200,
            renderer: "onPoli"
        }, {
            text: "Status Task ID",
            flex: 1,
            columns: [{
                dataIndex: "status",
                text: "Task ID 1",
                renderer: "onTask1"
            }, {
                dataIndex: "status",
                text: "Task ID 2",
                renderer: "onTask2"
            }, {
                dataIndex: "status",
                text: "Task ID 3",
                renderer: "onTask3"
            }, {
                dataIndex: "status",
                text: "Task ID 4",
                renderer: "onTask4"
            }, {
                dataIndex: "status",
                text: "Task ID 5",
                renderer: "onTask5"
            }, {
                dataIndex: "status",
                text: "Task ID 6",
                renderer: "onTask6"
            }, {
                dataIndex: "status",
                text: "Task ID 7",
                renderer: "onTask7"
            }]
        }, {
            text: "Status Kirim RSONLINE",
            width: 300,
            renderer: "onRenderStatusKirim"
        }], a.dockedItems = [{
            xtype: "pagingtoolbar",
            bind: {
                store: "{store}"
            },
            dock: "bottom",
            displayInfo: true
        }];
        a.callParent(arguments)
    },
    onSetGrid: function (d) {
        var b = this,
            e = b.down("[reference=posantrian]"),
            a = b.getViewModel().get("store");
        e.getStore().loadData(b.getAksesPosAntrian());
        a.queryParams = {
            tanggalperiksa: "0000-00-00",
            posantrian: ""
        };
        a.load()
    },
    getAksesPosAntrian: function () {
        var a = this;
        return a.penggunaAksesPos ? a.penggunaAksesPos : []
    },
    loadData: function () {
        var a = this;
        Ext.Ajax.request({
            url: webservice.location + "registrasionline/plugins/getAksesPosAntrian",
            useDefaultXhrHeader: false,
            withCredentials: true,
            success: function (d) {
                var b = Ext.JSON.decode(d.responseText);
                var e = b.data.AKSES_POS_ANTRIAN;
                a.penggunaAksesPos = e;
                a.onSetGrid(e)
            },
            failure: function (b) {
                return []
            }
        })
    }
});
Ext.define("antrian.pengaturan.rsonline.monitoring.ListController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-pengaturan-rsonline-monitoring-list",
    beforeEdit: function (e, d, b) {
        var g = this,
            f = g.getViewModel(),
            a = f.getStore("store"),
            h = a.getAt(d.rowIdx);
        if (h.get(d.field) == "1") {
            d.cancel = true
        }
    },
    onFilterAntrian: function (e) {
        var f = this,
            b = f.getReferences(),
            a = f.getViewModel().get("store"),
            d = b.tanggal.getValue(),
            g = b.posantrian.getValue();
        a.queryParams = {
            tanggalperiksa: d,
            posantrian: g
        };
        a.load()
    },
    onRefresh: function (b) {
        var d = this,
            a = d.getView();
        a.refresh()
    },
    onAntrian: function (b, a, d) {
        this.setBackGround(a, d.get("status"));
        return d.get("nomorantrean")
    },
    onPoli: function (d, b, e) {
        var a = e.get("REFERENSI").POLI_BPJS.NMPOLI;
        this.setBackGround(b, e.get("status"));
        return a
    },
    onRm: function (d, b, e) {
        var a = e.get("norm");
        this.setBackGround(b, e.get("status"));
        return a
    },
    onKartu: function (b, a, e) {
        var d = e.get("nomorkartu");
        this.setBackGround(a, e.get("status"));
        return d
    },
    onTask1: function (d, b, e) {
        var a = e.get("REFERENSI").TASK_1;
        this.setBackGroundTask(b, e.get("REFERENSI").STATUS_TASK_ID1);
        return a
    },
    onTask2: function (d, b, e) {
        var a = e.get("REFERENSI").TASK_2;
        this.setBackGroundTask(b, e.get("REFERENSI").STATUS_TASK_ID2);
        return a
    },
    onTask3: function (d, b, e) {
        var a = e.get("REFERENSI").TASK_3;
        this.setBackGroundTask(b, e.get("REFERENSI").STATUS_TASK_ID3);
        return a
    },
    onTask4: function (d, b, e) {
        var a = e.get("REFERENSI").TASK_4;
        this.setBackGroundTask(b, e.get("REFERENSI").STATUS_TASK_ID4);
        return a
    },
    onTask5: function (d, b, e) {
        var a = e.get("REFERENSI").TASK_5;
        this.setBackGroundTask(b, e.get("REFERENSI").STATUS_TASK_ID5);
        return a
    },
    onTask6: function (d, b, e) {
        var a = e.get("REFERENSI").TASK_6;
        this.setBackGroundTask(b, e.get("REFERENSI").STATUS_TASK_ID6);
        return a
    },
    onTask7: function (d, b, e) {
        var a = e.get("REFERENSI").TASK_7;
        this.setBackGroundTask(b, e.get("REFERENSI").STATUS_TASK_ID7);
        return a
    },
    onRenderStatusKirim: function (d, b, e) {
        var a = e.get("response");
        this.setBackGround(b, e.get("status"));
        return a
    },
    setBackGround: function (b, a) {
        if (a == 2) {
            b.style = "background-color:#0df775;color:#000000;font-weight: bold"
        }
    },
    setBackGroundTask: function (b, a) {
        if (a == 2) {
            b.style = "background-color:#0df775;color:#000000;font-weight: bold"
        } else {
            if (a == 0) {
                b.style = "background-color:#FFF;color:#000000;font-weight: bold"
            } else {
                b.style = "color:#DDD"
            }
        }
    }
});
Ext.define("antrian.pengaturan.rsonline.monitoring.Workspace", {
    extend: "com.Form",
    xtype: "antrian-pengaturan-rsonline-monitoring-workspace",
    controller: "antrian-pengaturan-rsonline-monitoring-workspace",
    bodyPadding: 2,
    layout: {
        type: "hbox",
        align: "stretch"
    },
    flex: 1,
    initComponent: function () {
        var a = this;
        a.items = [{
            flex: 1,
            layout: "border",
            items: [{
                region: "center",
                xtype: "antrian-pengaturan-rsonline-monitoring-list",
                reference: "listmonitoringstatusantrianrsonline",
                flex: 1
            }, {
                region: "south",
                xtype: "antrian-pengaturan-rsonline-monitoring-form",
                reference: "formmonitoringstatusantrianrsonline",
                border: true,
                listeners: {
                    kirimantrian: "onKirimAntrian",
                    updatewaktutunggu: "onUpdateWaktuTunggu",
                    batalantrian: "onBatalAntrian"
                }
            }]
        }];
        a.callParent(arguments)
    },
    onLoadRecord: function (e) {
        var b = this,
            d = b.down("antrian-pengaturan-rsonline-monitoring-list"),
            a = b.down("antrian-pengaturan-rsonline-monitoring-form");
        d.loadData();
        a.onLoadRecord()
    }
});
Ext.define("antrian.pengaturan.rsonline.monitoring.WorkspaceController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-pengaturan-rsonline-monitoring-workspace",
    onKirimAntrian: function () {
        var f = this,
            b = f.getView(),
            e = f.getReferences(),
            h = e.listmonitoringstatusantrianrsonline.getSelectionModel(),
            d = e.listmonitoringstatusantrianrsonline.getStore(),
            g = h.selected,
            a = Ext.create("antrian.kirimantrian.rsonline.Model", {});
        c = [];
        g.each(function (j) {
            if (j.get("status") == "0") {
                c.push(j)
            }
        });
        if (c.length > 0) {
            a.set("DETAIL_ANTRIAN", c);
            b.setLoading(true);
            a.save({
                callback: function (j, k, l) {
                    if (l) {
                        d.reload();
                        b.setLoading(false)
                    } else {
                        var m = JSON.parse(k.error.response.responseText);
                        f.getView().notifyMessage(m.detail, "danger-red");
                        d.reload();
                        b.setLoading(false)
                    }
                }
            })
        } else {
            b.notifyMessage("Silahkan Pilih Row Data Yang Akan Di Kirim", "danger-red")
        }
    },
    onUpdateWaktuTunggu: function (f) {
        var g = this,
            b = g.getView(),
            e = g.getReferences(),
            j = e.listmonitoringstatusantrianrsonline.getSelectionModel(),
            d = e.listmonitoringstatusantrianrsonline.getStore(),
            h = j.selected,
            a = Ext.create("antrian.waktutungguantrian.rsonline.Model", {});
        c = [];
        h.each(function (k) {
            console.log(k);
            console.log(k);
            console.log(k.get("REFERENSI").STATUS_TASK_ID1);
            if (f == "1") {
                if (k.get("REFERENSI").STATUS_TASK_ID1 == 0) {
                    if (k.get("REFERENSI").WAKTU_TASK_1 != 0) {
                        c.push({
                            kodebooking: k.get("kodebooking"),
                            taskid: f,
                            waktu: k.get("REFERENSI").WAKTU_TASK_1
                        })
                    }
                }
            }
            if (f == "2") {
                if (k.get("REFERENSI").STATUS_TASK_ID2 == 0) {
                    if (k.get("REFERENSI").WAKTU_TASK_2 != 0) {
                        c.push({
                            kodebooking: k.get("kodebooking"),
                            taskid: f,
                            waktu: k.get("REFERENSI").WAKTU_TASK_2
                        })
                    }
                }
            }
            if (f == "3") {
                if (k.get("REFERENSI").STATUS_TASK_ID3 == 0) {
                    if (k.get("REFERENSI").WAKTU_TASK_3 != 0) {
                        c.push({
                            kodebooking: k.get("kodebooking"),
                            taskid: f,
                            waktu: k.get("REFERENSI").WAKTU_TASK_3
                        })
                    }
                }
            }
            if (f == "4") {
                if (k.get("REFERENSI").STATUS_TASK_ID4 == 0) {
                    if (k.get("REFERENSI").WAKTU_TASK_4 != 0) {
                        c.push({
                            kodebooking: k.get("kodebooking"),
                            taskid: f,
                            waktu: k.get("REFERENSI").WAKTU_TASK_4
                        })
                    }
                }
            }
            if (f == "5") {
                if (k.get("REFERENSI").STATUS_TASK_ID5 == 0) {
                    if (k.get("REFERENSI").WAKTU_TASK_5 != 0) {
                        c.push({
                            kodebooking: k.get("kodebooking"),
                            taskid: f,
                            waktu: k.get("REFERENSI").WAKTU_TASK_5
                        })
                    }
                }
            }
            if (f == "6") {
                if (k.get("REFERENSI").STATUS_TASK_ID6 == 0) {
                    if (k.get("REFERENSI").WAKTU_TASK_6 != 0) {
                        c.push({
                            kodebooking: k.get("kodebooking"),
                            taskid: f,
                            waktu: k.get("REFERENSI").WAKTU_TASK_6
                        })
                    }
                }
            }
            if (f == "7") {
                if (k.get("REFERENSI").STATUS_TASK_ID7 == 0) {
                    if (k.get("REFERENSI").WAKTU_TASK_7 != 0) {
                        c.push({
                            kodebooking: k.get("kodebooking"),
                            taskid: f,
                            waktu: k.get("REFERENSI").WAKTU_TASK_7
                        })
                    }
                }
            }
        });
        if (c.length > 0) {
            a.set("DETAIL_ANTRIAN", c);
            b.setLoading(true);
            a.save({
                callback: function (k, l, m) {
                    if (m) {
                        d.reload();
                        b.setLoading(false)
                    } else {
                        var n = JSON.parse(l.error.response.responseText);
                        g.getView().notifyMessage(n.detail, "danger-red");
                        d.reload();
                        b.setLoading(false)
                    }
                }
            })
        } else {
            b.notifyMessage("Silahkan Pilih Row Data Yang Akan Di Kirim", "danger-red")
        }
    },
    onBatalAntrian: function (f) {
        var g = this,
            b = g.getView(),
            e = g.getReferences(),
            j = e.listmonitoringstatusantrianrsonline.getSelectionModel(),
            d = e.listmonitoringstatusantrianrsonline.getStore(),
            h = j.selected,
            a = Ext.create("antrian.waktutungguantrian.rsonline.batal.Model", {});
        c = [];
        h.each(function (k) {
            c.push({
                kodebooking: k.get("kodebooking"),
                keterangan: "Tidak Datang"
            })
        });
        if (c.length > 0) {
            a.set("DETAIL_ANTRIAN", c);
            b.setLoading(true);
            a.save({
                callback: function (k, l, m) {
                    if (m) {
                        d.reload();
                        b.setLoading(false)
                    } else {
                        var n = JSON.parse(l.error.response.responseText);
                        g.getView().notifyMessage(n.detail, "danger-red");
                        d.reload();
                        b.setLoading(false)
                    }
                }
            })
        } else {
            b.notifyMessage("Silahkan Pilih Row Data Yang Akan Di Kirim", "danger-red")
        }
    }
});
Ext.define("antrian.poli.Display.Display", {
    extend: "com.Form",
    xtype: "antrian-poli-display-display",
    controller: "antrian-poli-display-display",
    viewModel: {
        data: {
            instansi: undefined,
            namainstansi: "RSUP DR. WAHIDIN SUDIROHUSODO",
            infoTeks: "",
            tglNow: "-",
            statusWebsocket: "Disconnect",
            poliAntrian: "",
            posAntrian: "POLIK"
        },
        stores: {
            store: {
                type: "instansi-store"
            }
        }
    },
    audio: {
        integrasi: undefined,
        service: undefined
    },
    layout: {
        type: "vbox",
        align: "stretch"
    },
    defaults: {
        border: false
    },
    datapanggil: [],
    dataAntrian: [],
    audioCount: 1,
    audios: [],
    idx: 0,
    bodyStyle: "background-color:#aa8a51",
    initComponent: function () {
        var a = this;
        a.items = [{
            layout: {
                type: "hbox",
                align: "middle"
            },
            border: false,
            height: 50,
            bodyStyle: "padding-left:10px;background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,#19C5BF), color-stop(100%,#19C5BF));",
            items: [{
                flex: 1,
                bind: {
                    html: "{namainstansi}"
                },
                border: false,
                bodyStyle: "background-color:transparent; font-size: 20px; color: white;font-weight:bold"
            }, {
                xtype: "label",
                bind: {
                    html: "{tglNow}"
                },
                width: 350,
                border: false,
                style: "background-color:transparent; font-size: 18px; color: white;font-weight:bold"
            }]
        }, {
            flex: 1,
            bodyPadding: "20",
            layout: {
                type: "hbox",
                align: "stretch"
            },
            border: false,
            items: [{
                flex: 3,
                border: false,
                layout: {
                    type: "vbox",
                    align: "stretch"
                },
                items: [{
                    flex: 1,
                    reference: "dataview",
                    style: "margin-top:10px;background-color:#FFF",
                    xtype: "antrian-poli-display-view",
                    viewConfig: {
                        loadMask: false
                    }
                }]
            }, {
                flex: 2,
                border: false,
                layout: {
                    type: "vbox",
                    align: "stretch"
                },
                defaults: {
                    bodyStyle: "background-color:#D9D9D9"
                },
                items: [{
                    flex: 1,
                    border: true,
                    style: "padding:5px;background-color:#D9D9D9",
                    bodyStyle: "background-color:transparent",
                    html: '<iframe style="width:100%;height:100%;position: absolute;"src="classic/resources/images/banner-antrian/video.mp4" frameborder="0" allow="accelerometer loop="true" autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
                }]
            }]
        }, {
            layout: {
                type: "hbox",
                align: "middle"
            },
            height: 30,
            border: false,
            bodyStyle: "background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,#19C5BF), color-stop(100%,#19C5BF));",
            items: [{
                xtype: "displayfield",
                flex: 1,
                fieldStyle: "background-color:transparent;font-size: 14px;  margin-left: 10px;color: white;",
                border: false,
                bind: {
                    value: "<marquee>{infoTeks}</marquee>"
                }
            }]
        }];
        a.callParent(arguments)
    },
    onLoadRecord: function (b) {
        var e = this,
            f = e.down("antrian-poli-display-view"),
            d = Ext.Date.format(e.getSysdate(), "Y-m-d"),
            a = e.getController();
        a.mulai();
        if (b) {
            f.onLoadRecord(b, d)
        }
        e.audio.service = Ext.create("antrian.Audio", {
            parent: e,
            audioCount: 8,
            posAntrian: "-"
        });
        e.audios = e.audio.service.getAudios();
        if (e.audio.service) {
            e.add(e.audios)
        }
    },
    onAKhir: function (b) {
        var d = this,
            a = d.getViewModel().get("poliAntrian");
        d.dataAntrian.shift();
        d.datapanggil.shift();
        d.setProsesPanggil();
        d.onRefreshView(a)
    },
    getPosAntrian: function () {
        var b = this,
            a = b.getViewModel().get("poliAntrian");
        return a
    },
    onRefreshView: function (b) {
        var e = this,
            d = e.down("antrian-poli-display-view").getStore(),
            a = d.getQueryParams().POLI;
        if (a == b) {
            d.reload()
        }
    },
    runLogo: function () {
        if (this.deg == 360) {
            this.deg = 0
        } else {
            this.deg += 5
        }
        Ext.getCmp("idImage").setStyle("-webkit-transform: rotateY(" + this.deg + "deg)")
    },
    remove: function (d, b) {
        var a = Ext.Array.indexOf(d, b);
        if (a !== -1) {
            erase(d, a, 1)
        }
        return d
    },
    setProsesPanggil: function () {
        var b = this;
        if (b.datapanggil.length > 0) {
            var e = Ext.String.leftPad(b.datapanggil[0].nomor, 3, "0"),
                d = e.split("", 3);
            var a = {
                POLI: b.datapanggil[0].nmpoli,
                NOMOR1: d[0],
                NOMOR2: d[1],
                NOMOR3: d[2]
            };
            b.callAntrian(a)
        }
    },
    privates: {
        callAntrian: function (d) {
            var b = this;
            if (d) {
                var a = b.audio.service.speechAntrian(["in.wav", "nomor_antrian.mp3", d.NOMOR1 + ".mp3", d.NOMOR2 + ".mp3", d.NOMOR3 + ".mp3", "Silahkan_Ke.mp3", "Poliklinik.mp3", "out.wav"])
            }
        }
    }
});
Ext.define("antrian.poli.Display.DisplayController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-poli-display-display",
    currentRefreshTimeRuangan: 0,
    refreshTime: 0,
    onConnectWebsocket: function () {
        var d = this,
            b = d.getView(),
            f = d.getViewModel(),
            e = window.location.protocol == "https:" ? "wss" : "ws";
        var a = Ext.create("Ext.ux.WebSocket", {
            url: e + "://" + window.location.hostname + ":8899",
            listeners: {
                open: function (g) {
                    if (f) {
                        f.set("statusWebsocket", "Connected")
                    }
                },
                message: function (g, k) {
                    var h = JSON.parse(k);
                    if (h) {
                        if (h.act) {
                            if (h.act == "PANGGIL_POLI") {
                                if (f) {
                                    if (f.get("poliAntrian") == h.poli) {
                                        var j = h.nomor;
                                        if (!b.dataAntrian.includes(j)) {
                                            b.datapanggil.push(h);
                                            b.dataAntrian.push(j)
                                        }
                                        if (b.datapanggil.length === 1) {
                                            b.setProsesPanggil();
                                            b.onRefreshView(h.poli)
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                close: function (g) {
                    if (f) {
                        f.set("statusWebsocket", "Disonnected Socket")
                    }
                }
            }
        })
    },
    onAfterRender: function () {
        var e = this,
            b = e.getViewModel(),
            a = b.get("store"),
            d = Ext.getStore("instansi");
        if (d) {
            b.set("store", d);
            new Ext.util.DelayedTask(function () {
                b.set("instansi", d.getAt(0).get("PPK"))
            }).delay(1000)
        } else {
            a.doAfterLoad = function (f, h, g, j) {
                if (j) {
                    if (h.length > 0) {
                        b.set("instansi", h[0].get("PPK"))
                    }
                }
            };
            a.load()
        }
    },
    mulai: function (d) {
        var b = this,
            a = b.getViewModel();
        b.currentRefreshTimeRuangan = a.get("refreshTime");
        b.refreshTime = a.get("refreshTime");
        if (b.task == undefined) {
            b.task = {
                run: function () {
                    a.set("tglNow", Ext.Date.format(new Date(), "l, d F Y H:i:s"));
                    if (b.currentRefreshTimeRuangan == 0) {
                        b.currentRefreshTimeRuangan = b.refreshTime
                    }
                    b.currentRefreshTimeRuangan--;
                    a.set("refreshTime", b.currentRefreshTimeRuangan)
                },
                interval: 1000
            };
            Ext.TaskManager.start(b.task)
        }
    },
    destroy: function () {
        var a = this;
        Ext.TaskManager.stop(a.task);
        a.callParent()
    }
});
Ext.define("antrian.poli.Display.List", {
    extend: "com.Grid",
    alias: "widget.antrian-poli-display-list",
    controller: "antrian-poli-display-list",
    penggunaAksesPos: [],
    flex: 1,
    viewModel: {
        stores: {
            store: {
                type: "antrian-ruangan-store"
            }
        }
    },
    cls: "x-br-top",
    border: true,
    initComponent: function () {
        var a = this;
        a.dockedItems = [{
            xtype: "toolbar",
            dock: "top",
            style: "background:#19c5bf;border:1px #CCC solid",
            items: [{
                html: '<span style="font-weight:bold;font-size:12px">Display Antrian Poliklinik</span>'
            }, "->", {
                xtype: "combobox",
                name: "POS_ANTRIAN",
                allowBlank: false,
                enterFocus: true,
                reference: "posantrian",
                enforceMaxLength: true,
                forceSelection: true,
                validateOnBlur: true,
                displayField: "DESKRIPSI",
                valueField: "NOMOR",
                queryMode: "local",
                typeAhead: true,
                flex: 1,
                emptyText: "[ Pilih Pos Antrian ]",
                store: {
                    model: "antrian.posantrian.Model"
                },
                listeners: {
                    select: "onChangePos"
                }
            }]
        }, {
            xtype: "pagingtoolbar",
            bind: {
                store: "{store}"
            },
            dock: "bottom",
            items: ["->", {
                name: "TANGGAL",
                reference: "tglkumjungan",
                width: 200,
                xtype: "datefield",
                margin: "0px 50px 0px 0px",
                format: "Y-m-d",
                bind: {
                    minValue: "{minDate}"
                },
                value: a.getSysdate(),
                maxValue: a.getSysdate(),
                allowBlank: false
            }, {
                text: "Tampilkan",
                xtype: "button",
                ui: "soft-blue",
                listeners: {
                    click: "onMulai"
                }
            }]
        }], a.columns = [{
            xtype: "templatecolumn",
            align: "left",
            tpl: '<div style="margin-bottom:5px;margin-top:5px;font-weight: 800; font-size:24px; white-space:normal !important;">{ID} | {DESKRIPSI}</div>',
            flex: 1
        }];
        a.callParent(arguments)
    },
    onSetGrid: function () {
        var a = this,
            b = a.down("[reference=posantrian]");
        b.getStore().loadData(a.getAksesPosAntrian())
    },
    getAksesPosAntrian: function () {
        var a = this;
        return a.penggunaAksesPos ? a.penggunaAksesPos : []
    },
    loadData: function () {
        var b = this,
            a = b.getViewModel().get("store");
        a.queryParams = {
            ANTRIAN: "",
            STATUS: 1
        };
        a.load();
        Ext.Ajax.request({
            url: webservice.location + "registrasionline/plugins/getAksesPosAntrian",
            useDefaultXhrHeader: false,
            withCredentials: true,
            success: function (e) {
                var d = Ext.JSON.decode(e.responseText);
                var f = d.data.AKSES_POS_ANTRIAN;
                b.penggunaAksesPos = f;
                b.onSetGrid(f)
            },
            failure: function (d) {
                return []
            }
        })
    }
});
Ext.define("antrian.poli.Display.ListController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-poli-display-list",
    onChangePos: function () {
        var d = this,
            a = d.getReferences(),
            e = a.posantrian.getValue(),
            b = {};
        obj = {
            STATUS: 1,
            ANTRIAN: ""
        };
        if (e) {
            b = {
                ANTRIAN: e
            };
            obj = Ext.apply(obj, b)
        }
        d.getView().load(obj)
    },
    onSearch: function (k, g) {
        var h = this,
            j = h.getViewModel(),
            a = j.get("store");
        parameter = a.getQueryParams();
        a.queryParams = {
            QUERY: g,
            start: 0,
            page: 1
        };
        a.load()
    },
    onClear: function () {
        var e = this,
            f = e.getViewModel(),
            a = f.get("store");
        delete a.queryParams.QUERY;
        delete a.queryParams.start;
        delete a.queryParams.page;
        a.load()
    },
    onMulai: function (a) {
        var b = this;
        b.getView().fireEvent("tampil")
    }
});
Ext.define("antrian.poli.Display.View", {
    extend: "Ext.view.View",
    xtype: "antrian-poli-display-view",
    viewModel: {
        stores: {
            store: {
                type: "antrian-panggilantrianpoli-store"
            }
        }
    },
    layout: {
        type: "vbox",
        align: "stretch"
    },
    loadMask: false,
    autoScroll: true,
    cls: "laporan-main laporan-dataview",
    bind: {
        store: "{store}"
    },
    itemSelector: "div.thumb-wrap",
    tpl: Ext.create("Ext.XTemplate", '<tpl for=".">', '<div class="thumb-wrap big-33 small-50" style="text-align:center;width:100%;display:grid;padding:15px;">', '<a class="thumb" href="#" style="background:#E9967A">', '<div class="thumb-title-container" style="float:right;width:100%">', '<div class="thumb-title"><p style="font-size:22px;">ANTRIAN</p></div>', '<div class="thumb-title">', '<p style="font-size:64px;">{[this.formatNomor(values.nomorantrean)]}</p>', "</div>", "</div>", '<div class="thumb-title-container" style="float:left;width:100%;border-top:2px #DDD solid">', '<div class="thumb-title"><p style="font-size:22px;">NORM. {[this.getFormatNorm(values.norm)]}</p></div>', "</div>", "</a>", "</div>", "</tpl>", {
        formatNomor: function (a) {
            var b = Ext.String.leftPad(a, 3, "0");
            return b
        },
        getFormatNorm: function (e) {
            var a = Ext.String.leftPad(e, 8, "0"),
                f = Ext.String.insert(Ext.String.insert(Ext.String.insert(a, ".", 2), ".", 5), ".", 8);
            return f
        }
    }),
    onLoadRecord: function (b, d) {
        console.log(b);
        var e = this,
            a = e.getViewModel().get("store"),
            f = b.map(function (h, g) {
                return "'" + encodeURIComponent(h) + "'"
            }).join(",");
        if (a) {
            a.setQueryParams({
                GET_ANTRIAN_PANGGIL: 1,
                POLI: f,
                TANGGAL: d,
                start: 0,
                limit: 1
            });
            a.load();
            a.setQueryParams({
                GET_ANTRIAN_PANGGIL: 1,
                POLI: [b],
                TANGGAL: d,
                start: 0,
                limit: 1
            });
            a.load()
        }
    },
    getStore: function () {
        return this.getViewModel().get("store")
    },
    reload: function () {
        var b = this.getViewModel().get("store");
        if (b) {
            b.reload()
        }
    }
});
Ext.define("antrian.poli.Display.Workspace", {
    extend: "com.Form",
    xtype: "antrian-poli-display-workspace",
    controller: "antrian-poli-display-workspace",
    layout: "fit",
    bodyPadding: 2,
    items: [{
        xtype: "antrian-poli-display-list",
        checkboxModel: true,
        reference: "antrianpolidisplaylist",
        selModel: {
            selType: "checkboxmodel",
            checkOnly: true
        },
        listeners: {
            itemdblclick: "onPilihPoli",
            tampil: "onSelectPoli"
        }
    }],
    load: function () {
        var a = this,
            b = a.down("antrian-poli-display-list");
        b.loadData()
    }
});
Ext.define("antrian.poli.Display.WorkspaceController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-poli-display-workspace",
    onPilihPoli: function (b, e, a) {
        var d = this;
        d.onProsesDisplayAntrian(e)
    },
    onSelectPoli: function (d, h, b) {
        var e = this,
            a = e.getReferences(),
            g = "",
            f = a.antrianpolidisplaylist.getSelection(),
            g = [];
        Ext.Array.each(f, function (k) {
            g.push(k.get("ID"))
        });
        var j = g.map(function (l, k) {
            return "'" + encodeURIComponent(l) + "'"
        }).join(",");
        console.log(j);
        e.onDisplayAntrian(g)
    },
    onDisplayAntrian: function (b) {
        var d = this,
            a = d.getView();
        dialog = a.openDialog("", true, 0, 0, {
            xtype: "antrian-poli-display-display",
            ui: "panel-cyan",
            hideColumns: true
        }, function (f, g) {
            var e = g.down("antrian-poli-display-display");
            e.onLoadRecord(b);
            g.on("close", function () {
                a.onLoadRecord()
            })
        })
    },
    onProsesDisplayAntrian: function (b) {
        var e = this,
            a = e.getView(),
            d = Ext.Date.format(a.getSysdate(), "Y-m-d");
        dialog = a.openDialog("", true, 0, 0, {
            xtype: "antrian-poli-display-display",
            ui: "panel-cyan",
            hideColumns: true
        }, function (g, h) {
            var f = h.down("antrian-poli-display-display");
            f.onLoadRecord(b, d);
            h.on("close", function () {
                a.onLoadRecord()
            })
        })
    }
});
Ext.define("antrian.poli.List", {
    extend: "com.Grid",
    xtype: "antrian-poli-list",
    controller: "antrian-poli-list",
    penggunaAksesPos: [],
    viewModel: {
        stores: {
            store: {
                type: "antrian-antrianpoli-store"
            },
            storepemanggil: {
                type: "antrian-panggilantrianpoli-store"
            }
        },
        data: {
            tgltemp: undefined,
            tglSkrng: undefined,
            statusWebsocket: "disconnect",
            statusBtnWebsocket: "red",
            isConnect: true,
            aksesResponPasien: true,
            listConfig: {
                autoRefresh: true
            }
        },
        formulas: {
            autoRefreshIcon: function (a) {
                return a("listConfig.autoRefresh") ? "x-fa fa-stop" : "x-fa fa-play"
            },
            tooltipAutoRefresh: function (a) {
                return a("listConfig.autoRefresh") ? "Hentikan Perbarui Otomatis" : "Jalankan Perbarui Otomatis"
            }
        }
    },
    initComponent: function () {
        var a = this;
        a.createMenuContext();
        a.dockedItems = [{
            xtype: "toolbar",
            dock: "top",
            style: "background:#19c5bf;border:1px #CCC solid",
            items: [{
                html: '<span style="font-weight:bold;font-size:14px">Monitoring Antrian Poliklinik</span>'
            }, "->", {
                bind: {
                    html: '<span style="color:{statusBtnWebsocket}">{statusWebsocket}</span>'
                }
            }, {
                xtype: "combobox",
                name: "POLI",
                allowBlank: false,
                enterFocus: true,
                reference: "fpoli",
                enforceMaxLength: true,
                forceSelection: true,
                validateOnBlur: true,
                displayField: "DESKRIPSI",
                valueField: "ID",
                queryMode: "local",
                typeAhead: true,
                emptyText: "[ Pilih Poliklinik ]",
                store: {
                    model: "data.model.Kategori"
                },
                listeners: {
                    select: "onChangeTgl"
                }
            }, {
                xtype: "datefield",
                name: "FTANGGAL",
                format: "d-m-Y",
                reference: "ftanggal",
                listeners: {
                    change: "onChangeTgl"
                }
            }, {
                xtype: "combo",
                reference: "combointerval",
                width: 75,
                store: {
                    fields: ["ID"],
                    data: [{
                        ID: 5
                    }, {
                        ID: 10
                    }, {
                        ID: 15
                    }, {
                        ID: 20
                    }, {
                        ID: 25
                    }, {
                        ID: 30
                    }]
                },
                editable: false,
                displayField: "ID",
                valueField: "ID",
                value: 15,
                bind: {
                    disabled: "{listConfig.autoRefresh}"
                }
            }, {
                xtype: "button",
                enableToggle: true,
                pressed: true,
                bind: {
                    iconCls: "{autoRefreshIcon}",
                    tooltip: "{tooltipAutoRefresh}"
                },
                toggleHandler: "onToggleRefresh"
            }]
        }, {
            xtype: "pagingtoolbar",
            bind: {
                store: "{store}"
            },
            dock: "bottom",
            displayInfo: true,
            items: ["-", {}, {}, {
                xtype: "combobox",
                reference: "statusrespon",
                emptyText: "[ Filter Status ]",
                store: Ext.create("Ext.data.Store", {
                    fields: ["value", "desk"],
                    data: [{
                        value: "ALL",
                        desk: "Semua"
                    }, {
                        value: "1",
                        desk: "Belum Respon"
                    }, {
                        value: "2",
                        desk: "Sudah Respon"
                    }]
                }),
                queryMode: "local",
                displayField: "desk",
                value: 1,
                flex: 1,
                valueField: "value",
                listeners: {
                    select: "onChangeTgl"
                }
            }]
        }], a.columns = [{
            text: "Jenis",
            align: "left",
            menuDisabled: true,
            sortable: false,
            dataIndex: "REF",
            flex: 0.3,
            renderer: "onRenderJenisApp"
        }, {
            text: "No.Antrian",
            dataIndex: "NOMOR",
            menuDisabled: true,
            sortable: false,
            align: "left",
            flex: 0.3,
            renderer: "onAntrian"
        }, {
            text: "Poli Tujuan",
            dataIndex: "POLI",
            menuDisabled: true,
            sortable: false,
            align: "left",
            flex: 0.5,
            renderer: "onPoli"
        }, {
            text: "Tgl. Kunjungan",
            align: "left",
            menuDisabled: true,
            sortable: false,
            dataIndex: "TANGGAL",
            flex: 0.5,
            renderer: "onTglK"
        }, {
            text: "No RM",
            align: "left",
            menuDisabled: true,
            sortable: false,
            dataIndex: "REF",
            flex: 0.5,
            renderer: "onNorm"
        }, {
            text: "Nama",
            dataIndex: "REF",
            align: "left",
            menuDisabled: true,
            sortable: false,
            renderer: "onRenderNama",
            flex: 0.5
        }, {
            text: "Kontak",
            align: "left",
            menuDisabled: true,
            sortable: false,
            dataIndex: "REF",
            flex: 0.5,
            renderer: "onKontak"
        }, {
            text: "Tgl. Lahir",
            dataIndex: "REF",
            menuDisabled: true,
            sortable: false,
            align: "left",
            renderer: "onRenderTgl",
            flex: 0.5
        }, {
            text: "Panggil",
            menuDisabled: true,
            sortable: false,
            xtype: "actioncolumn",
            align: "center",
            width: 100,
            items: [{
                xtype: "tool",
                iconCls: "x-fa fa-bullhorn",
                tooltip: "Panggil Antrian",
                handler: "onClickPanggil"
            }]
        }, {
            text: "Terima",
            menuDisabled: true,
            sortable: false,
            xtype: "actioncolumn",
            align: "center",
            width: 50,
            items: [{
                xtype: "tool",
                iconCls: "x-fa fa-arrow-circle-right",
                tooltip: "Terima Kedatangan Pasien",
                handler: "onClickTerima"
            }]
        }];
        a.callParent(arguments)
    },
    listeners: {
        rowcontextmenu: "onKlikKananMenu"
    },
    createMenuContext: function () {
        var b = this;
        b.menucontext = new Ext.menu.Menu({
            items: [{
                text: "Terima Kedatangan Pasien",
                iconCls: "x-fa fa-arrow-circle-right",
                handler: function () {
                    b.getController().onRespon()
                }
            }, {
                text: "Refresh",
                glyph: "xf021@FontAwesome",
                handler: function () {
                    b.getController().onRefresh()
                }
            }]
        });
        return b.menucontext
    },
    loadData: function () {
        var e = this,
            d = e.getViewModel(),
            a = e.down("[reference=fpoli]"),
            f = e.down("[reference=ftanggal]"),
            b = Ext.Date.format(e.getSysdate(), "Y-m-d");
        a.getStore().loadData(e.getPenggunaRuangan());
        f.setValue(e.getSysdate());
        d.set("tglSkrng", b)
    }
});
Ext.define("antrian.poli.ListController", {
    extend: "Ext.app.ViewController",
    alias: "controller.antrian-poli-list",
    websocket: undefined,
    init: function () {
        var d = this;
        if (window.location.protocol == "http:") {
            var b = "ws"
        } else {
            var b = "wss"
        }
        var a = b + "://" + window.location.hostname + ":8899";
        d.websocket = new WebSocket(a);
        d.websocket.onopen = function (e) {
            d.getViewModel().set("statusWebsocket", "Connected");
            d.getViewModel().set("statusBtnWebsocket", "green")
        };
        d.websocket.onerror = function (e) {
            d.getViewModel().set("statusWebsocket", "Error");
            d.getViewModel().set("statusBtnWebsocket", "red")
        };
        d.websocket.onclose = function (e) {
            d.getViewModel().set("statusWebsocket", "Disconnect");
            d.getViewModel().set("statusBtnWebsocket", "red")
        }
    },
    onsearch: function (j, g) {
        var h = this,
            a = h.getView(),
            d = h.getViewModel(),
            b = d.get("store");
        if (b) {
            b.removeAll();
            parameter = b.getQueryParams();
            b.setQueryParams({
                QUERY: g,
                TANGGALKUNJUNGAN: parameter.TANGGALKUNJUNGAN
            });
            b.load()
        }
    },
    onSelectStatus: function (b, g) {
        var f = this,
            e = f.getViewModel(),
            d = e.get("store");
        if (g.get("value") == "0") {
            delete d.queryParams.STATUS;
            d.removeAll()
        } else {
            d.removeAll();
            parameter = d.getQueryParams();
            d.setQueryParams({
                STATUS: g.get("value"),
                TANGGALKUNJUNGAN: parameter.TANGGALKUNJUNGAN,
                QUERY: parameter.QUERY
            })
        }
        d.load()
    },
    onSelectPos: function (b, g) {
        var f = this,
            e = f.getViewModel(),
            d = e.get("store");
        if (g.get("value") == "0") {
            delete d.queryParams.POS_ANTRIAN;
            d.removeAll();
            d.load()
        } else {
            d.removeAll();
            parameter = d.getQueryParams();
            d.setQueryParams({
                POS_ANTRIAN: g.get("value"),
                TANGGALKUNJUNGAN: parameter.TANGGALKUNJUNGAN,
                STATUS: parameter.STATUS,
                QUERY: parameter.QUERY
            });
            d.load()
        }
    },
    onClear: function () {
        var e = this,
            f = e.getViewModel(),
            a = f.get("store");
        delete a.queryParams.QUERY;
        a.removeAll();
        a.load()
    },
    onToggleRefresh: function (e, g) {
        var f = this,
            a = f.getView(),
            d = f.getReferences(),
            b = Number(d.combointerval.getValue()) * 1000;
        a.setListConfig({
            autoRefresh: e.pressed
        });
        if (e.pressed) {
            a.start(b)
        } else {
            a.stop()
        }
    },
    onChangeTgl: function () {
        var e = this,
            b = e.getReferences(),
            f = b.ftanggal,
            a = b.fpoli.getValue(),
            d = {};
        obj = {
            TANGGAL: Ext.Date.format(f.getValue(), "Y-m-d"),
            POLI: ""
        };
        if (a) {
            d = {
                POLI: a
            };
            obj = Ext.apply(obj, d)
        }
        e.getView().load(obj)
    },
    onRenderJenisApp: function (b, a, e) {
        var d = e.get("REFERENSI").ANTRIAN.REFERENSI.JENIS_APP;
        this.setBackGround(a, e.get("STATUS"));
        return d
    },
    onRenderNama: function (b, a, e) {
        var d = e.get("REFERENSI").ANTRIAN.NAMA;
        this.setBackGround(a, e.get("STATUS"));
        return d
    },
    onAntrian: function (b, a, d) {
        this.setBackGround(a, d.get("STATUS"));
        return Ext.String.leftPad(b, 3, "0")
    },
    onPoli: function (d, b, e) {
        if (e.get("REFERENSI").ANTRIAN.JENIS_APLIKASI == 2) {
            var a = e.get("REFERENSI").ANTRIAN.REFERENSI.POLI_BPJS.NMPOLI
        } else {
            if (e.get("JENIS_APLIKASI") == 5) {
                var a = "-"
            } else {
                var a = e.get("REFERENSI").ANTRIAN.REFERENSI.POLI.DESKRIPSI
            }
        }
        this.setBackGround(b, e.get("STATUS"));
        return a
    },
    onTglK: function (b, a, d) {
        this.setBackGround(a, d.get("STATUS"));
        return Ext.Date.format(d.get("TANGGAL"), "d-m-Y")
    },
    onNorm: function (d, b, e) {
        var a = e.get("REFERENSI").ANTRIAN.NORM;
        this.setBackGround(b, e.get("STATUS"));
        return a
    },
    onKontak: function (b, a, e) {
        var d = e.get("REFERENSI").ANTRIAN.CONTACT;
        this.setBackGround(a, e.get("STATUS"));
        return d
    },
    onRenderTgl: function (b, a, e) {
        var d = e.get("REFERENSI").ANTRIAN.TANGGAL_LAHIR;
        this.setBackGround(a, e.get("STATUS"));
        return d
    },
    setBackGround: function (b, a) {
        if (a == 3) {
            b.style = "background-color:#DDD;color:#000000;font-weight: bold"
        }
        if (a == 2) {
            b.style = "background-color:#0df775;color:#000000;font-weight: bold"
        }
        if (a == 1) {
            b.style = "background-color:red;color:#000000;font-weight: bold"
        }
        if (a == 0) {
            b.style = "background-color:red;color:#000000;font-weight: bold"
        }
    },
    onKlikKananMenu: function (e, j, n, k, l) {
        var o = this,
            m = l.getXY();
        l.stopEvent();
        o.getView().menucontext.showAt(m)
    },
    onClickPanggil: function (a, n, b) {
        var j = this,
            l = j.getView(),
            e = j.getViewModel(),
            m = e.get("store"),
            d = a.getStore().getAt(n),
            f = j.getViewModel().get("tglSkrng"),
            k = j.getReferences(),
            h = Ext.Date.format(d.get("TANGGAL"), "Y-m-d");
        if (k.fpoli.getSelection()) {
            if (f === h) {
                var g = 0;
                if (d.get("STATUS") == 2) {
                    g = 1
                }
                if (d.get("STATUS") == 3) {
                    g = 1
                }
                if (g == 0) {
                    l.notifyMessage("Gagal..Antrian Belum Bisa DI Respon, Belum Di Lakukan Pendaftaran Loket")
                } else {
                    l.setLoading(true);
                    d.set("PANGGIL", 1);
                    d.set("ASAL_REFX", d.get("ASAL_REF"));
                    d.set("REFX", d.get("REF"));
                    d.set("POLIX", d.get("POLI"));
                    d.set("NOMORX", d.get("NOMOR"));
                    d.set("TANGGALX", h);
                    d.set("STATUSX", 2);
                    d.save({
                        callback: function (q, p, r) {
                            if (r) {
                                l.notifyMessage("Data Berhasil Di Respon");
                                var o = {
                                    pesan: "Silahkan Ke Poliklinik",
                                    poli: q.get("POLI"),
                                    nmpoli: k.fpoli.getSelection().get("DESKRIPSI"),
                                    nomor: q.get("NOMOR"),
                                    act: "PANGGIL_POLI"
                                };
                                if (l.getViewModel().get("statusWebsocket") == "Connected") {
                                    j.websocket.send(JSON.stringify(o))
                                } else {
                                    l.notifyMessage("Koneksi Socket Terputus", "danger-red")
                                }
                                m.reload();
                                l.setLoading(false)
                            } else {
                                l.notifyMessage("Data Gagal Di Respon");
                                l.setLoading(false)
                            }
                        }
                    })
                }
            } else {
                l.notifyMessage("Hanya tanggal Kunjungan Hari ini yang dapat direspon")
            }
        }
    },
    onClickTerima: function (a, n, b) {
        var j = this,
            l = j.getView(),
            e = j.getViewModel(),
            m = e.get("store"),
            d = a.getStore().getAt(n),
            f = j.getViewModel().get("tglSkrng"),
            k = j.getReferences(),
            h = Ext.Date.format(d.get("TANGGAL"), "Y-m-d");
        if (k.fpoli.getSelection()) {
            if (f === h) {
                var g = 0;
                if (d.get("STATUS") == 2) {
                    g = 1
                }
                if (d.get("STATUS") == 3) {
                    g = 1
                }
                if (g == 0) {
                    l.notifyMessage("Gagal..Antrian Belum Bisa DI Respon, Belum Di Lakukan Pendaftaran Loket")
                } else {
                    l.setLoading(true);
                    d.set("TERIMA", 1);
                    d.set("ASAL_REFX", d.get("ASAL_REF"));
                    d.set("REFX", d.get("REF"));
                    d.set("STATUSX", 3);
                    d.save({
                        callback: function (p, o, q) {
                            if (q) {
                                l.notifyMessage("Data Berhasil Di Respon");
                                m.reload();
                                l.setLoading(false)
                            } else {
                                l.notifyMessage("Data Gagal Di Respon");
                                l.setLoading(false)
                            }
                        }
                    })
                }
            } else {
                l.notifyMessage("Hanya tanggal Kunjungan Hari ini yang dapat direspon")
            }
        }
    },
    onRefresh: function () {
        var a = this.getView();
        a.reload()
    }
});
Ext.define("antrian.poli.Workspace", {
    extend: "com.Form",
    xtype: "antrian-poli-workspace",
    layout: "fit",
    bodyPadding: 2,
    items: [{
        xtype: "antrian-poli-list"
    }],
    load: function () {
        var a = this,
            b = a.down("antrian-poli-list");
        b.loadData()
    }
});
Ext.define("antrian.Service", {
    extend: "com.Service",
    xtype: "antrian-service",
    serviceName: "registrasionline",
    createAntrian: function (a, b) {
        this.request("reservasi", "POST", a, b)
    }
});
