connection.query("UPDATE qualification SET education_level=?, institution=?, cv_link=?, skill_type=? WHERE prisoner_id=?", [educationLevel, institution, cvLink, skillType,prisonerId], function(err, res1){
            if(err){
                data.res = err;
                res.json(data);
            }
            else{
                data.err= 0;
                data.res = "Successful qualification";
                res.json(data);
            }
            
connection.query("select * from qualification where (prisoner_id=? and id=?) limit 1 ", [prisoner_id, id], function(err, res1)
                 
                 
                 
