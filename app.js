const express = require('express'),
    app = express(),
    bodyParser = require("body-parser"),
    nodemon = require("nodemon"),
    PORT = process.env.PORT || 5000, //PORT tanımı
    mysql = require("mysql")


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));


var db = mysql.createConnection({  // MYSQL options
    host: "localhost",
    user: "root",
    port: "8889",
    password: "root",
    database: 'employeesDb'
});

db.connect(function (err) { // MYSQL Bağlantısı
    if (err) throw err;
    console.log("Bağlantı Başarılı...");

})
app.get('/', function (req, res) {
    res.render("index")
});

app.get('/personelListesi', function (req, res) {
    db.query(
        `SELECT * FROM employees`,
        function (err, results, fields) {
            res.render("personelListesi", { results: results, fields: fields });
        }
    );
});

app.get('/personelEkle', function (req, res) {
    res.render("personelEkle");
});

app.post('/personelEkle', function (req, res) {

    var asi_turu = req.body.asi_turu;
    var asi_doz = req.body.asi_doz;

    if (asi_turu === "") {
        asi_doz = null;
        asi_turu = null;
    }

    const personelDetails = {
        tc_no: req.body.tc_no,
        isim: req.body.isim,
        soyisim: req.body.soyisim,
        kan_grubu: req.body.kan_grubu,
        dogum_yeri: req.body.dogum_yeri,
        pozisyon: req.body.pozisyon,
        maas: req.body.maas,
        egitim: req.body.egitim,
        asi_turu: asi_turu,
        asi_doz: asi_doz
    }

    var sql = `INSERT INTO employees SET ?`;
    db.query(sql, personelDetails, function (err, data) {
        if (err) throw err;
        console.log("User dat is inserted successfully ");
    });
    res.redirect('/');
});

app.get('/personelDuzenle/:id', function (req, res) {
    db.query(
        `SELECT * FROM employees WHERE personel_id = ${db.escape(req.params.id)}`,
        function (err, results, fields) {
            if (err) throw err;
            console.log(results)

            res.render("personelDuzenle", { results: results, fields: fields });
        }
    );
});
app.post('/personel/:id', function (req, res) {

    var asi_turu = req.body.asi_turu;
    var asi_doz = req.body.asi_doz;

    if (asi_turu === "") {
        asi_doz = null;
        asi_turu = null;
    }
    const personelDetails = {
        tc_no: req.body.tc_no,
        isim: req.body.isim,
        soyisim: req.body.soyisim,
        kan_grubu: req.body.kan_grubu,
        dogum_yeri: req.body.dogum_yeri,
        pozisyon: req.body.pozisyon,
        maas: req.body.maas,
        egitim: req.body.egitim,
        asi_turu: asi_turu,
        asi_doz: asi_doz
    }
    var sql = `UPDATE employees SET ? WHERE personel_id = ${db.escape(req.params.id)}`;
    db.query(sql, personelDetails, function (err, data) {
        if (err) throw err;
        console.log("User dat is inserted successfully ");
    });
    res.redirect('/');

});

app.get('/delete_personel/:id', function (req, res) {
    db.query(
        `DELETE FROM employees WHERE personel_id = ${db.escape(req.params.id)}`,
        function (err, results, fields) {
            if (err) throw err;
            res.redirect("/");
        }
    );
});
app.get('/profil/:id', function (req, res) {
    var id = req.params.id
    db.query(
        `SELECT * FROM employees WHERE personel_id = ${db.escape(id)} `,
        function (err, personelData, fields) {
            if (err) throw err;

            db.query(
                `SELECT * FROM working_days WHERE personel_id = ${db.escape(id)} `,
                function (err, workingData, fields) {

                    if (err) throw err;
                    var bas;
                    var bit;
                    workingData.forEach(element => {

                        bas = element.baslama_saati;
                        bit = element.bitis_saati;
                    });

                    db.query(
                        `SELECT TIMESTAMPDIFF(HOUR, baslama_saati, bitis_saati) as saat FROM working_days WHERE personel_id = ${db.escape(id)}`,
                        function (err, haftalikSaat, fields) {

                            if (err) throw err;

                            res.render("profil", { personelData: personelData, workingData: workingData, haftalikSaat: haftalikSaat, id: id });
                            console.log(haftalikSaat)
                        })
                })
        })
});
app.get('/calismaBilgisiEkle/:id', function (req, res) {
    var id = req.params.id
    db.query(
        `SELECT * FROM working_days WHERE personel_id = ${db.escape(id)}`,
        function (err, results, fields) {
            if (err) throw err;

            if (results != "") {
                res.send("Çalışma bilgisi zaten mevcut.");
            }
            else {

                res.render("calismaBilgisiEkle", { id: id });
            }
        })
});

app.post('/calismaBilgisiEkle/:id', function (req, res) {

    const workingDetails = {
        personel_id: req.params.id,
        haftaici: req.body.haftaici,
        haftasonu: req.body.haftasonu,
        baslama_saati: req.body.baslama_saati,
        bitis_saati: req.body.bitis_saati
    }

    var sql = `INSERT INTO working_days SET ?`;
    db.query(sql, workingDetails, function (err, data) {
        if (err) throw err;
        console.log("User dat is inserted successfully ");
    });
    res.redirect(`/profil/${req.params.id}`);
});

app.get('/calismaBilgisiDuzenle/:id', function (req, res) {
    var id = req.params.id
    db.query(
        `SELECT * FROM working_days WHERE personel_id = ${db.escape(id)}`,
        function (err, results, fields) {
            if (err) throw err;

            if (results == "") {
                res.send("Çalışma bilgisi bulunamadı.");
            }
            else {

                res.render("calismaBilgisiDuzenle", { results: results, id: id });
                console.log(results)
            }

        })
});

app.get('/delete_calisma_bilgisi/:id', function (req, res) {
    db.query(
        `DELETE FROM working_days WHERE personel_id = ${db.escape(req.params.id)}`,
        function (err, results, fields) {
            if (err) throw err;
            res.redirect("/");
        }
    );
});

app.post('/calismaBilgisiDuzenle/:id', function (req, res) {

    const workingDetails = {
        personel_id: req.params.id,
        haftaici: req.body.haftaici,
        haftasonu: req.body.haftasonu,
        baslama_saati: req.body.baslama_saati,
        bitis_saati: req.body.bitis_saati
    }

    var sql = `UPDATE working_days SET ? WHERE personel_id = ${db.escape(req.params.id)}`;
    db.query(sql, workingDetails, function (err, data) {
        if (err) throw err;
        console.log("User dat is inserted successfully ");
    });
    res.redirect('/');
});

app.get('/hastaliklar', function (req, res) {
    db.query(
        `SELECT DISTINCT employees.personel_id, diseases.hastalik_id,  isim, soyisim, hastalik_adi, hastalik_tarihi, semptomlar, kronik  FROM employees, diseases WHERE employees.personel_id = diseases.personel_id`,

        function (err, results, fields) {

            results.forEach(element => {

                if (element.kronik === 0) {
                    element.kronik = 'Hayır';
                }
                else {
                    element.kronik = 'Evet';
                }
            });
            res.render("hastalik", { results: results, fields: fields });
        }

    );
});

app.get('/hastalikEkle', function (req, res) {
    res.render("hastalikEkle");
});
app.post('/hastalikEkle', function (req, res) {

    const hastalikDetails = {
        personel_id: req.body.personel_id,
        hastalik_adi: req.body.hastalik_adi,
        hastalik_tarihi: req.body.hastalik_tarihi,
        semptomlar: req.body.semptomlar,
        kronik: req.body.kronik
    }

    var sql = `INSERT INTO diseases SET ?`;
    db.query(sql, hastalikDetails, function (err, data) {
        if (err) throw err;
        console.log("User dat is inserted successfully ");
    });
    res.redirect('/hastaliklar');
});

app.get('/hastalikDuzenle/:id', function (req, res) {
    db.query(
        `SELECT * FROM diseases WHERE hastalik_id = ${db.escape(req.params.id)}`,
        function (err, results, fields) {
            if (err) throw err;
            res.render("hastalikDuzenle", { results: results, fields: fields });
        }
    );
});

app.post('/hastalikDuzenle/:id', function (req, res) {

    const personelDetails = {
        personel_id: req.body.personel_id,
        hastalik_adi: req.body.hastalik_adi,
        hastalik_tarihi: req.body.hastalik_tarihi,
        semptomlar: req.body.semptomlar,
        kronik: req.body.kronik,
    }
    var sql = `UPDATE diseases SET ? WHERE hastalik_id = ${db.escape(req.params.id)}`;
    db.query(sql, personelDetails, function (err, data) {
        if (err) throw err;
        console.log("User dat is inserted successfully ");
    });
    res.redirect('/hastaliklar');

});
app.get('/delete_hastalik/:id', function (req, res) {

    db.query(
        `DELETE d FROM diseases d INNER JOIN receteler r ON d.hastalik_id = r.hastalik_id WHERE d.hastalik_id = ${db.escape(req.params.id)}`,
        function (err, results, fields) {
            if (err) throw err;

            db.query(
                `DELETE FROM receteler WHERE hastalik_id = ${db.escape(req.params.id)}`,
                function (err, results, fields) {
                    if (err) throw err;

                }
            );
            res.redirect("/hastaliklar");
        }
    );
});
app.get('/recete/:id', function (req, res) {

    db.query(
        `SELECT * FROM receteler WHERE hastalik_id= ${db.escape(req.params.id)} `,
        function (err, results, fields) {
            if (err) throw err;

            var ilac, doz;
            if (results == "") {
                res.send("Reçete bilgisi bulunamadı...");
            }
            else {
                results.forEach(element => {
                    ilac = `${element.ilaclar}`
                    doz = `${element.dozlar}`

                });
                res.render("receteBilgisi", { results: results, ilac: ilac, doz: doz });
            }
        }
    );
});

app.get('/receteEkle/:id', function (req, res) {

    var id = req.params.id;

    db.query(
        `SELECT * FROM receteler WHERE hastalik_id = ${db.escape(id)} `,
        function (err, results, fields) {
            if (err) throw err;

            if (results != "") {
                res.send("Reçete bilgisi zaten mevcut.");
            }
            else {

                res.render("receteEKle", { id, id });
            }
        }
    );
});
app.post('/receteEkle/:id', function (req, res) {

    const recete = {
        hastalik_id: req.params.id,
        ilaclar: req.body.ilaclar,
        dozlar: req.body.dozlar,
    }

    var sql = `INSERT INTO receteler SET ?`;
    db.query(sql, recete, function (err, data) {
        if (err) throw err;
        console.log("User dat is inserted successfully ");
    });
    res.redirect('/hastaliklar');
});

app.get('/receteDuzenle/:id', function (req, res) {
    db.query(
        `SELECT * FROM receteler WHERE hastalik_id = ${db.escape(req.params.id)}`,
        function (err, results, fields) {

            if (err) throw err;

            res.render("receteDuzenle", { results: results, fields: fields })
        }
    );
});
app.post('/receteDuzenle/:id', function (req, res) {

    const receteDetails = {
        ilaclar: req.body.ilaclar,
        dozlar: req.body.dozlar
    }
    var sql = `UPDATE receteler SET ? WHERE hastalik_id = ${db.escape(req.params.id)}`;
    db.query(sql, receteDetails, function (err, data) {
        if (err) throw err;
        console.log("User dat is inserted successfully ");
    });
    res.redirect('/hastaliklar');

});
app.get('/delete_recete/:id', function (req, res) {
    db.query(
        `DELETE FROM receteler WHERE hastalik_id = ${db.escape(req.params.id)}`,
        function (err, results, fields) {
            if (err) throw err;
            console.log(results)

            res.redirect("/hastaliklar");
        }
    );
});

app.get('/covid19', function (req, res) {
    db.query(
        `SELECT  employees.personel_id, covid_id, isim, soyisim, baslangic_tarihi, bitis_tarihi, belirtiler  FROM employees, covid WHERE employees.personel_id = covid.personel_id `,

        function (err, results, fields) {

            res.render("covid_19", { results: results, fields: fields });
            console.log(results)
        }

    );
});

app.get('/covidEkle', function (req, res) {
    res.render("covidEkle");
});
app.post('/covidEkle', function (req, res) {

    const covidDetails = {
        personel_id: req.body.personel_id,
        baslangic_tarihi: req.body.baslangic_tarihi,
        bitis_tarihi: req.body.bitis_tarihi,
        belirtiler: req.body.belirtiler,

    }

    var sql = `INSERT INTO covid SET ?`;
    db.query(sql, covidDetails, function (err, data) {
        if (err) throw err;
        console.log("User dat is inserted successfully ");
    });
    res.redirect('/covid19');
});

app.get('/covidDuzenle/:id', function (req, res) {
    db.query(
        `SELECT * FROM covid WHERE covid_id = ${db.escape(req.params.id)}`,
        function (err, results, fields) {

            if (err) throw err;

            res.render("covidDuzenle", { results: results, fields: fields })
        }
    );
});
app.post('/covidDuzenle/:id', function (req, res) {

    const receteDetails = {
        ilaclar: req.body.ilaclar,
        dozlar: req.body.dozlar
    }
    var sql = `UPDATE receteler SET ? WHERE hastalik_id = ${db.escape(req.params.id)}`;
    db.query(sql, receteDetails, function (err, data) {
        if (err) throw err;
        console.log("User dat is inserted successfully ");
    });
    res.redirect('/covid');

});
app.get('/delete_covid/:id', function (req, res) {
    db.query(
        `DELETE FROM covid WHERE covid_id = ${db.escape(req.params.id)}`,
        function (err, results, fields) {
            if (err) throw err;

            res.redirect("/covid19");
        }
    );
});

app.get('/egitim_durumu_ile_covid_arasindaki_iliski', function (req, res) {
    db.query(
        `SELECT COUNT(*) as covid_sayisi, employees.egitim FROM employees, covid WHERE employees.personel_id = covid.personel_id GROUP BY egitim`,
        function (err, results, fields) {
            if (err) throw err;
            res.render("egitim_covid",{results:results});
        }
    );
});






app.listen(PORT, () => console.log("Example app listening on port port!"));